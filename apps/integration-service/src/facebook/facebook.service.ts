import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from 'src/db/db.provider';
import { channelAccounts, eq } from '@repo/db';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FacebookService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async getPages(userAccessToken: string) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`,
      );
      const data = await res.json();

      if (data.error) {
        throw new BadRequestException(data.error.message);
      }

      return {
        success: true,
        pages: data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
        })),
      };
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async connectFacebook(
    userAccessToken: string,
    pageId: string,
    userId: string,
  ) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`,
      );
      const data = await res.json();

      if (!data.data) {
        throw new BadRequestException('Cannot fetch pages');
      }

      const page = data.data.find((p: any) => p.id === pageId);

      if (!page) {
        throw new BadRequestException(
          "Page not found or you don't have permission",
        );
      }

      const pageAccessToken = page.access_token;

      const existed = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.externalId, pageId));

      if (existed.length > 0) {
        throw new BadRequestException('Page already connected');
      }

      const channelId = uuidv4();

      await this.db.insert(channelAccounts).values({
        id: channelId,
        userId,
        platform: 'facebook',
        externalId: pageId,
        name: page.name,
        accessToken: pageAccessToken,
        webhookUrl: `${process.env.BASE_URL}/webhooks/facebook`,
        status: 'connecting',
      });

      const subRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`,
        {
          method: 'POST',
          body: new URLSearchParams({
            access_token: pageAccessToken,
            subscribed_fields: 'messages,messaging_postbacks',
          }),
        },
      );

      const subData = await subRes.json();

      if (!subData.success) {
        throw new BadRequestException('Failed to subscribe webhook');
      }

      await this.db
        .update(channelAccounts)
        .set({ status: 'active' })
        .where(eq(channelAccounts.id, channelId));

      return {
        success: true,
        message: 'Facebook connected successfully',
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }
}
