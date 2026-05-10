import { Inject, Injectable } from '@nestjs/common';
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
export class AppService {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
  ) {}

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
          name:channelAccounts.name
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

      await this.db.transaction(async (tx) => {
        const campaignId = uuidv4();
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
}
