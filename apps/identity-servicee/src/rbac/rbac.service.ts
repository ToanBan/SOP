import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from 'src/db/db.provider';
import { rolePermissions } from 'src/db/schemas/role_permissions.schema';
import { eq, inArray } from 'drizzle-orm/sql/expressions/conditions';
import { permissions } from 'src/db/schemas/permissions.schema';
import { users } from 'src/db/schemas/user.schema';
import { roles } from 'src/db/schemas/role.schema';
import { userRoles } from 'src/db/schemas/user_roles.schema';
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
    const rows = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id));

    const grouped = Object.values(
      rows.reduce((acc, cur) => {
        if (!acc[cur.id]) {
          acc[cur.id] = {
            id: cur.id,
            username: cur.username,
            email: cur.email,
            roles: [],
          };
        }

        acc[cur.id].roles.push(cur.roleName);
        return acc;
      }, {} as any),
    );

    return grouped;
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

  async assignRole(userId: string, RolesId: string[]) {
    try {
      const existUser = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!existUser.length) {
        throw new Error('User not found');
      }

  

      await this.db.transaction(async (tx) => {
        await tx.delete(userRoles).where(eq(userRoles.userId, userId));
        if (RolesId.length > 0) {
          const userRolesData = RolesId.map((roleId) => ({
            userId,
            roleId,
          }));
          await tx.insert(userRoles).values(userRolesData);
        }
      });
      return { success: true, message: 'Assigned roles successfully' };

    } catch (error) {
      console.error(error);
      return { success: false || 'Failed to assign roles' };
    }
      
  }
}
