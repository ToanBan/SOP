import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import {
  conversations,
  channelAccounts,
  campaigns,
  campaignTargets,
  campaignMedias,
} from '@repo/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import { inArray } from 'drizzle-orm';
@Injectable()
export class AppService {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
  ) {}

  async getAllConversations() {
    try {
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
        })
        .from(conversations)
        .innerJoin(
          channelAccounts,
          eq(conversations.channelAccountId, channelAccounts.id),
        );

      if (!conversationsDb) {
        throw new Error('Not found');
      }

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
      let mediaUrls: { url: string; type: string }[] = [];

      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          const blob = new Blob([file.buffer], { type: file.mimetype });
          formData.append('files', blob, file.originalname);
        });

        const result = await fetch(`http://localhost:8000/media/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await result.json();
        console.log(data);
        mediaUrls = data;
      }

      await this.db.transaction(async (tx) => {
        const campaignId = uuidv4();
        await tx.insert(campaigns).values({
          id: campaignId,
          content,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        });

        if (mediaUrls) {
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

      const targetsWithInfo = await this.db
        .select({
          conversationId: conversations.id,
          externalConversationId: conversations.externalConversationId,
          platform: channelAccounts.platform,
          botToken: channelAccounts.accessToken,
        })
        .from(conversations)
        .innerJoin(
          channelAccounts,
          eq(conversations.channelAccountId, channelAccounts.id),
        )
        .where(inArray(conversations.id, conversationIds));

      for (const target of targetsWithInfo) {
        if (mediaUrls.length > 0) {
          for (const media of mediaUrls) {
            this.queue.channel.publish(
              'chat_exchange',
              'message.reply',
              Buffer.from(
                JSON.stringify({
                  platform: target.platform,
                  botToken: target.botToken,
                  chatId: target.externalConversationId,
                  message: content,
                  mediaUrl: media
                }),
              ),
              { persistent: true },
            );
          }
        } else {
          this.queue.channel.publish(
            'chat_exchange',
            'message.reply',
            Buffer.from(
              JSON.stringify({
                platform: target.platform,
                botToken: target.botToken,
                chatId: target.externalConversationId,
                message: content,
                mediaUrl: null,
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
}
