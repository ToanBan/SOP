import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssignPermissionsDto } from 'src/dto/AssignPermissions';
import { RbacService } from './rbac.service';
import type { Request } from 'express';
import { AssignRoleDto } from 'src/dto/AssignRoleDto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('/assign-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @Post('/assign-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async assignRole(@Req() req: Request, @Body() dto: AssignRoleDto) {
    return this.rbacService.assignRole(dto.userId, dto.roleIds);
  }
}
