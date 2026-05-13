import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import {
  conversations,
  channelAccounts,
  campaigns,
  campaignTargets,
  campaignMedias,
} from '@repo/db';
import { eq, inArray } from '@repo/db';
import { v4 as uuidv4 } from 'uuid';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import { REDIS_PROVIDER } from './redis/redis.provider';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
  ) {}

  private async startConsumer() {
    try {
      const channel = this.queue.channel;
      const exchange = 'feed_exchange';

      await channel.assertExchange(exchange, 'topic', {
        durable: true,
      });
      const q = await channel.assertQueue('facebook.reactions', {
        durable: true,
      });
      await channel.bindQueue(q.queue, exchange, 'facebook.feed.reaction');
      channel.consume(q.queue, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
        } catch (error) {}
      });
    } catch (error) {}
  }

  async onModuleInit() {
    await this.startConsumer();
  }

  async getAllChannelAccount() {
    const cacheKey = 'conversations:all';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }

      const conversationsDb = await this.db
        .select({
          id: conversations.id,
          channelAccountId: conversations.channelAccountId,
          type: conversations.type,
          title: conversations.title,
          externalConversationId: conversations.externalConversationId,
          lastMessageAt: conversations.lastMessageAt,
          conversationType: conversations.conversationType,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          platform: channelAccounts.platform,
          externalId: channelAccounts.externalId,
          name: channelAccounts.name,
        })
        .from(conversations)
        .innerJoin(
          channelAccounts,
          eq(conversations.channelAccountId, channelAccounts.id),
        );

      await this.redis.set(cacheKey, JSON.stringify(conversationsDb), 'EX', 60);

      return { success: true, data: conversationsDb };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }

  async createCampaign(
    content: string,
    conversationIds: string[],
    scheduledAt: string,
    files?: any[],
  ) {
    try {
      if (scheduledAt) {
        const scheduled = new Date(scheduledAt);
        const now = new Date();

        if (scheduled <= now) {
          return {
            success: false,
            message: 'scheduledAt must be greater than current time',
          };
        }
      }

      let mediaUrls: [] = [];

      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          const blob = new Blob([file.buffer], { type: file.mimetype });
          formData.append('files', blob, file.originalname);
        });

        const result = await fetch(`http://localhost:8000/media/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'x-internal-key': `your_internal_key_secret`,
          },
        });
        const data = await result.json();
        mediaUrls = data;
      }
      const campaignId = uuidv4();
      await this.db.transaction(async (tx) => {
        await tx.insert(campaigns).values({
          id: campaignId,
          content,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        });

        if (mediaUrls.length > 0) {
          await tx.insert(campaignMedias).values(
            mediaUrls.map((media, index) => ({
              id: uuidv4(),
              campaignId,
              mediaUrl: media,
              order: index,
            })),
          );
        }

        if (conversationIds.length > 0) {
          await tx.insert(campaignTargets).values(
            conversationIds.map((conversationId) => ({
              id: uuidv4(),
              campaignId,
              conversationId,
              status: 'pending',
            })),
          );
        }
      });

      await this.redis.del('campagins:all');

      const targetsWithInfo = await this.db
        .select({
          channelAccountId: channelAccounts.id,
          conversationId: conversations.id,
          externalConversationId: conversations.externalConversationId,
          platform: channelAccounts.platform,
          botToken: channelAccounts.accessToken,
          pageId: channelAccounts.externalId,
        })
        .from(conversations)
        .innerJoin(
          channelAccounts,
          eq(conversations.channelAccountId, channelAccounts.id),
        )
        .where(inArray(conversations.id, conversationIds));

      for (const target of targetsWithInfo) {
        if (target.platform === 'facebook') {
          this.queue.channel.publish(
            'chat_exchange',
            'message.campaign',
            Buffer.from(
              JSON.stringify({
                platform: 'facebook',
                type: 'feed',
                pageId: target.pageId,
                botToken: target.botToken,
                message: content,
                mediaUrls,
                campaignId,
                channelAccountId: target.channelAccountId,
              }),
            ),
            { persistent: true },
          );

          continue;
        }

        const mediasToSend = mediaUrls.length > 0 ? mediaUrls : [null];

        for (let i = 0; i < mediasToSend.length; i++) {
          const mediaUrl = mediasToSend[i];
          const isLast = i === mediasToSend.length - 1;
          this.queue.channel.publish(
            'chat_exchange',
            'message.campaign',
            Buffer.from(
              JSON.stringify({
                platform: target.platform,
                botToken: target.botToken,
                chatId: target.externalConversationId,
                message: isLast ? content : '',
                mediaUrl,
              }),
            ),
            { persistent: true },
          );
        }
      }
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async getAllCampaign() {
    const cacheKey = 'campagins:all';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const rows = await this.db
        .select({
          id: campaigns.id,
          content: campaigns.content,
          scheduledAt: campaigns.scheduledAt,
          mediaUrl: campaignMedias.mediaUrl,
          mediaOrder: campaignMedias.order,
        })
        .from(campaigns)
        .leftJoin(campaignMedias, eq(campaigns.id, campaignMedias.campaignId))
        .orderBy(campaigns.createdAt, campaignMedias.order);

      const result = Object.values(
        rows.reduce(
          (acc, row) => {
            if (!acc[row.id]) {
              acc[row.id] = {
                id: row.id,
                content: row.content,
                scheduledAt: row.scheduledAt,
                mediaUrls: [],
              };
            }

            if (row.mediaUrl) {
              acc[row.id].mediaUrls.push(row.mediaUrl);
            }

            return acc;
          },
          {} as Record<
            string,
            {
              id: string;
              content: string;
              scheduledAt: Date | null;
              mediaUrls: string[];
            }
          >,
        ),
      );

      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }

  async getReactionsPostFacebook(campaignId: string) {
    try {
      const result = await this.db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId));

      if (result.length <= 0) {
        return { success: false, message: 'Not Found' };
      }

      const externalPostId = result[0].externalPostId;
      const channelAccountId = result[0].channelAccountId;

      if (!externalPostId || !channelAccountId) {
        return { success: false, message: `Missing` };
      }

      const channelAccount = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelAccountId));
      if (channelAccount.length <= 0) {
        return { success: false, message: `Not Found` };
      }

      const accessToken = channelAccount[0].accessToken;
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${externalPostId}/reactions?fields=id,name,type&summary=true&access_token=${accessToken}`,
      );
      const data = await res.json();

      if (data.error) {
        return { success: false, message: data.error.message };
      }

      const grouped = data.data.reduce((acc: any, item: any) => {
        if (!acc[item.type]) {
          acc[item.type] = { count: 0, users: [] };
        }
        acc[item.type].count++;
        acc[item.type].users.push({ id: item.id, name: item.name });
        return acc;
      }, {});

      return {
        success: true,
        totalCount: data.summary.total_count,
        reactions: grouped,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async getCommentsPostFacebook(campaignId: string) {
    try {
      const result = await this.db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId));

      if (result.length <= 0) {
        return { success: false, message: 'Not Found' };
      }

      const externalPostId = result[0].externalPostId;
      const channelAccountId = result[0].channelAccountId;

      if (!externalPostId || !channelAccountId) {
        return { success: false, message: `Missing` };
      }

      const channelAccount = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelAccountId));
      if (channelAccount.length <= 0) {
        return { success: false, message: `Not Found` };
      }

      const accessToken = channelAccount[0].accessToken;

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${externalPostId}/comments?fields=id,message,from,created_time,comments{id,message,from,created_time}&summary=true&access_token=${accessToken}`,
      );
      const data = await res.json();
      if (data.error) {
        return { success: false, message: data.error.message };
      }

      const comments = data.data.map((comment: any) => ({
        id: comment.id,
        message: comment.message,
        from: comment.from,
        createdTime: comment.created_time,
        replies:
          comment.comments?.data?.map((reply: any) => ({
            id: reply.id,
            message: reply.message,
            from: reply.from,
            createdTime: reply.created_time,
          })) ?? [],
      }));
      return {
        success: true,
        totalCount: data.summary.total_count,
        comments,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async replyCommentPostFacebook(
    campaignId: string,
    message: string,
    commentId?: string,
  ) {
    try {
      if (!campaignId) {
        throw new BadRequestException('Missing CommentId');
      }

      const result = await this.db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId));

      if (result.length <= 0) return { success: false, message: 'Not Found' };

      const channelAccountId = result[0].channelAccountId;
      if (!channelAccountId) return { success: false, message: 'Not Found' };

      const channelAccount = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelAccountId));

      if (channelAccount.length <= 0)
        return { success: false, message: 'Not Found' };

      const accessToken = channelAccount[0].accessToken;
      const externalPostId = result[0].externalPostId;
      const targetId = commentId ? commentId : externalPostId;

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${targetId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, access_token: accessToken }),
        },
      );
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }
}
