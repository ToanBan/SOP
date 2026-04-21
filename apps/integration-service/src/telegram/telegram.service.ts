import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from 'src/db/db.provider';
import { channelAccounts } from '@repo/db';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
@Injectable()
export class TelegramService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async connectTelegram(botToken: string, integrationId: string) {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (!data.ok) {
      throw new BadRequestException('Invalid bot token');
    }
    const bot = data.result;
    const webhookUrl = `${process.env.BASE_URL}/webhooks/telegram`;
    const channelId = uuidv4();
    await this.db.insert(channelAccounts).values({
      id: channelId,
      integrationId,
      platform: 'telegram',
      externalId: bot.id.toString(),
      name: bot.username,
      accessToken: botToken,
      webhookUrl,
      status: 'connecting',
    });

    const webhookRes = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`,
    );
    const webhookData = await webhookRes.json();
    if (!webhookData.ok) {
      throw new BadRequestException('Failed to set webhook');
    }

    await this.db
      .update(channelAccounts)
      .set({ status: 'active' })
      .where(eq(channelAccounts.id, channelId));

    return {
      message: 'Telegram connected successfully',
      bot,
    };
  }
}
