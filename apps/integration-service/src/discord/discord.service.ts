import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { channelAccounts } from '@repo/db';

import { DB_PROVIDER } from 'src/db/db.provider';
import { v4 as uuidv4 } from 'uuid';
import { Client, GatewayIntentBits, Partials, ChannelType } from 'discord.js';
import { AppService } from 'src/app.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client!: Client;

  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    private readonly appService: AppService,
  ) {}

  onModuleInit() {
    console.log('Đang khởi tạo Bot Discord ');

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
      ],
    });

    this.client.on('clientReady', () => {
      console.log(`Kết nối thành công! Bot: ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.partial) {
        try {
          await message.fetch();
        } catch (err) {
          console.error('Không fetch được message:', err);
          return;
        }
      }

      console.log(message);

      if (message.author.bot) return;

      try {
        const botId = this.client.user?.id;
        if (!botId) {
          console.error('Bot chưa ready');
          return;
        }
        const [channelAccount] = await this.db
          .select()
          .from(channelAccounts)
          .where(eq(channelAccounts.externalId, botId))
          .limit(1);

        if (!channelAccount) {
          console.error('Không tìm thấy channelAccount cho bot:', botId);
          return;
        }

        const normalized = this.normalizeMessage(channelAccount.id, message);

        await this.appService.pushMessageToQueue(normalized);
      } catch (err) {
        console.error('Lỗi xử lý Discord message:', err);
      }
    });

    this.client.on('error', (error) => {
      console.error('Lỗi Discord Client:', error);
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
      console.error('Lỗi Login:', err.message);
    });
  }

  private normalizeMessage(channelId: string, message: any) {
    const attachment = message.attachments?.first();
    let type = 'text';
    let mediaUrl = null;

    if (attachment) {
      const contentType = attachment.contentType || '';
      if (contentType.startsWith('image/')) type = 'image';
      else if (contentType.startsWith('video/')) type = 'video';
      else type = 'file';

      mediaUrl = attachment.url;
    }

    return {
      channelId,
      platform: 'discord',
      conversationExternalId: message.channelId,
      customerExternalId: message.author.id,
      messageExternalId: message.id,
      type,
      text: message.content || null,
      mediaUrl,
      raw: message,
    };
  }

  async connectDiscord(botToken: string, integrationId: string) {
    try {
      const res = await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      const bot = await res.json();

      console.log("botttt", bot);
      if (res.status !== 200)
        throw new BadRequestException('Invalid Discord bot token');

      const existing = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.externalId, bot.id))
        .limit(1);
      if (existing.length > 0)
        return { success: false, message: 'Bot already connected' };

      const guildsRes = await fetch(
        `https://discord.com/api/v10/users/@me/guilds`,
        {
          headers: { Authorization: `Bot ${botToken}` },
        },
      );

    
      const guilds = await guildsRes.json();
      console.log("guidddddddd", guilds);
      const guildId = guilds[0].id; 

      const channelsRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
          headers: { Authorization: `Bot ${botToken}` },
        },
      );
      const channels = await channelsRes.json();

      const textChannel = channels.find((c: any) => c.type === 0);

      const webhookRes = await fetch(
        `https://discord.com/api/v10/channels/${textChannel.id}/webhooks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Chat Integration' }),
        },
      );
      const webhook = await webhookRes.json();
      console.log("đạhạkdksa", webhook);

      const channelId = uuidv4();
      await this.db.insert(channelAccounts).values({
        id: channelId,
        integrationId,
        platform: 'discord',
        externalId: bot.id,
        name: bot.username,
        accessToken: botToken,
        webhookUrl:webhook.url, // ← tự động lưu
        status: 'active',
      });

      return {
        success: true,
        message: 'Discord connected successfully',
        bot: { id: bot.id, username: bot.username },
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: `failed ${error}` };
    }
  }
}
