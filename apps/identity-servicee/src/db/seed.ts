import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DB_PROVIDER } from '../db/db.provider';
import { roles } from './schemas/role.schema';
import { permissions } from './schemas/permissions.schema';
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  private PERMISSIONS = [
    'message.read',
    'message.reply',
    'message.assign',
    'message.delete',

    'customer.create',
    'customer.read',
    'customer.update',
    'customer.delete',

    'order.create',
    'order.read',
    'order.update',
    'order.delete',

    'post.create',
    'post.read',
    'post.update',
    'post.delete',
  ];

  async onModuleInit() {
    await this.seedRoles();
    await this.seedPermissions();
  }

  private async seedRoles() {
    const adminRole = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .limit(1);

    if (adminRole.length === 0) {
      await this.db.insert(roles).values({
        id: uuidv4(),
        name: 'admin',
      });
    }

    const marketingRole = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'marketing'))
      .limit(1);

    if (marketingRole.length === 0) {
      await this.db.insert(roles).values({
        id: uuidv4(),
        name: 'marketing',
      });
    }

    const salesRole = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'sales'))
      .limit(1);

    if (salesRole.length === 0) {
      await this.db.insert(roles).values({
        id: uuidv4(),
        name: 'sales',
      });
    }

    console.log('Roles seeded successfully');
  }

  private async seedPermissions() {
    for (const perm of this.PERMISSIONS) {
      const exists = await this.db
        .select()
        .from(permissions)
        .where(eq(permissions.name, perm))
        .limit(1);

      if (exists.length === 0) {
        await this.db.insert(permissions).values({
          id: uuidv4(),
          name: perm,
        });
      }
    }

    console.log('Permissions seeded successfully');
  }
}
