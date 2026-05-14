import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provide';
import { v4 as uuidv4 } from 'uuid';
import {
  and,
  desc,
  eq,
  notificationReads,
  notifications,
  users,
} from '@repo/db';

@Injectable()
export class AppService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async getNotifications(page: number = 1, limit: number = 5, userId: string) {
    try {
      const offset = (page - 1) * limit;

      const results = await this.db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      const data = await Promise.all(
        results.map(async (n) => {
          const read = await this.db
            .select()
            .from(notificationReads)
            .where(
              and(
                eq(notificationReads.notificationId, n.id),
                eq(notificationReads.userId, userId),
              ),
            )
            .limit(1);

          return {
            notificationId: n.id,
            type: n.type,
            data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
            receivedAt: n.createdAt,
            isRead: read.length > 0,
          };
        }),
      );

      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async readNotification(notificationId: string, userId: string) {
    try {
      const existed = await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId))
        .limit(1);

      const userExisted = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (existed.length <= 0 || userExisted.length <= 0) {
        return { success: false, message: 'Miss match information' };
      }

      const alreadyRead = await this.db
        .select()
        .from(notificationReads)
        .where(
          and(
            eq(notificationReads.notificationId, notificationId),
            eq(notificationReads.userId, userId),
          ),
        )
        .limit(1);

      if (alreadyRead.length > 0) {
        return { success: true, message: 'Already read' };
      }

      await this.db.insert(notificationReads).values({
        id: uuidv4(),
        notificationId,
        userId,
      });

      return { success: true, message: 'Marked as read' };
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const results = await this.db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt));

      const unread = await Promise.all(
        results.map(async (n) => {
          const read = await this.db
            .select()
            .from(notificationReads)
            .where(
              and(
                eq(notificationReads.notificationId, n.id),
                eq(notificationReads.userId, userId),
              ),
            )
            .limit(1);
          return read.length === 0;
        }),
      );

      const count = unread.filter(Boolean).length;
      return { success: true, count };
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }
}
