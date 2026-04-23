import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { channelAccounts } from '@repo/db';
import { eq } from 'drizzle-orm';
import { DB_PROVIDER } from 'src/db/db.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscordService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async connectDiscord(botToken: string, integrationId: string) {
    try {
      const res = await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      });

      const bot = await res.json();

      if (res.status !== 200) {
        throw new BadRequestException('Invalid Discord bot token');
      }
      const channelId = uuidv4();
      const webhookUrl = `${process.env.BASE_URL}/webhooks/discord/${channelId}`;

      const existingChannelAccount = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.externalId, bot.id))
        .limit(1);

      if (existingChannelAccount.length > 0) {
        return {
          success: false,
          message: 'Bot already connected',
        };
      }

      if (existingChannelAccount.length > 0) {
        return {
          success: false,
          message: 'Bot already connected',
        };
      }

      await this.db.insert(channelAccounts).values({
        id: channelId,
        integrationId,
        platform: 'discord',
        externalId: bot.id,
        name: bot.username,
        accessToken: botToken,
        webhookUrl,
        status: 'active',
      });
      return {
        success:true,
        message: 'Discord connected successfully',
        bot: {
          id: bot.id,
          username: bot.username,
        },
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: `failed ${error}` };
    }
  }

  // private startListen(botToken: string, webhookUrl: string) {
  //   const client = new Client({
  //     intents: [
  //       GatewayIntentBits.DirectMessages,
  //       GatewayIntentBits.MessageContent,
  //       GatewayIntentBits.GuildMessages,
  //     ],
  //     partials: [Partials.Channel],
  //   });

  //   client.on('messageCreate', async (message: Message) => {
  //     if (message.author.bot) return;
  //     console.log('--- Có tin nhắn mới từ Discord ---');
  //     console.log('Nội dung:', message.content);
  //     console.log('Bắn về Webhook:', webhookUrl);

  //     await fetch(webhookUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(message.toJSON()),
  //     });
  //   });

  //   client.login(botToken);
  // }
}
