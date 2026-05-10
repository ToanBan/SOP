import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { channelAccounts, eq } from '@repo/db';

import { DB_PROVIDER } from 'src/db/db.provider';
import { v4 as uuidv4 } from 'uuid';
import { Client, GatewayIntentBits, Partials, ChannelType } from 'discord.js';
import { AppService } from 'src/app.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client!: Client;

  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    private readonly appService: AppService,
  ) {}

  onModuleInit() {
 
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
      ],
    });

    this.client.on('clientReady', () => {
      console.log(`Connected! Bot: ${this.client.user?.tag}`);
    });

    this.client.on('raw', async (data) => {
      if (data.t !== 'MESSAGE_CREATE') return;

      if (data.d?.author?.bot) return;

      try {
        const botId = this.client.user?.id;
        if (!botId) return;

        const [channelAccount] = await this.db
          .select()
          .from(channelAccounts)
          .where(eq(channelAccounts.externalId, botId))
          .limit(1);

        if (!channelAccount) {
          console.error('Not channelAccount Bot:', botId);
          return;
        }

        const d = data.d;
        const attachments = d.attachments || [];
        let type = 'text';
        let mediaUrls: string[] = [];

        if (attachments.length > 0) {
          mediaUrls = attachments.map((a: any) => a.proxy_url);
          type = 'media';
        }

        console.log("media urls", mediaUrls);
        const conversationType = d.guild_id ? 'channel' : 'direct';
        const normalized = {
          channelId: channelAccount.id,
          platform: 'discord',
          conversationExternalId: d.channel_id,
          customerExternalId: d.author?.id,
          messageExternalId: d.id,
          conversationType,
          type,
          text: d.content || null,
          mediaUrls,
          raw: d,
        };

        await this.appService.pushMessageToQueue(normalized);
      } catch (error) {
        return {success:false, message:`Failed ${error}`}
      }
    });

    this.client.on('error', (error) => {
      console.error('Error Discord Client:', error);
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
      console.error('Error Login:', err.message);
    });
  }

  

  async connectDiscord(botToken: string, userId: string) {
    try {
      const res = await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      const bot = await res.json();

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

      const channelId = uuidv4();
      await this.db.insert(channelAccounts).values({
        id: channelId,
        userId,
        platform: 'discord',
        externalId: bot.id,
        name: bot.username,
        accessToken: botToken,
        webhookUrl: webhook.url,
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
