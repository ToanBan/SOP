import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssignPermissionsDto } from 'src/dto/AssignPermissions';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('/assign-permissions')
  async assignPermissionsToRole(@Body() dto: AssignPermissionsDto) {
    return this.rbacService.assignPermissionsToRole(
      dto.roleId,
      dto.permissions,
    );
  }

  @Get('/permissions')
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('/users')
  async getUsers() {
    return this.rbacService.getUsers();
  }

  @Get('/roles')
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Get(':roleId/permissions')
  async getPermissionsByRole(@Param('roleId') roleId: string) {
    return this.rbacService.getPermissionsByRole(roleId);
  }
}
