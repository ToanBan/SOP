import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from 'src/db/db.provider';
import { rolePermissions } from 'src/db/schemas/role_permissions.schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { permissions } from 'src/db/schemas/permissions.schema';
import { users } from 'src/db/schemas/user.schema';
import { roles } from 'src/db/schemas/role.schema';
@Injectable()
export class RbacService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    const existRole = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!existRole.length) {
      throw new Error('Role not found');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));
      if (permissions.length > 0) {
        const rolePermissionsData = permissions.map((permissionId) => ({
          roleId,
          permissionId,
        }));

        await tx.insert(rolePermissions).values(rolePermissionsData);
      }
    });

    return {
      message: 'Permissions updated successfully',
      success: true,
    };
  }

  async getAllPermissions() {
    const permissionsDb = await this.db.select().from(permissions);

    if (!permissions) {
      throw new Error('Không Tìm Thấy');
    }

    return permissionsDb;
  }

 

  async getUsers() {
    const usersDb = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: roles.name,
        roleId: roles.id,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    if (!usersDb) {
      throw new Error('Không có user');
    }

    return usersDb;
  }

  async getRoles() {
    const rolesDb = await this.db.select().from(roles);
    if (!rolesDb) {
      throw new Error('Không Có Vai Trò');
    }

    return rolesDb;
  }

  async getPermissionsByRole(roleId: string) {
    const rows = await this.db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, roleId));

    return rows;
  }
}
