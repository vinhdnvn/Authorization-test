import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Role } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
// import { RolePermission } from '../role-permission/role-permission.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { PermissionsGuard } from '../permissions/guard/permission.guard';
import { UsersService } from '../users/users.service';
import { UserRoleDto } from '../users/dto/user-role.dto';
import { PermissionService } from '../permissions/permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User, UserRoleDto]), forwardRef(() => AuthModule)],
  controllers: [RoleController],
  providers: [ConfigService, RoleService, PermissionsGuard, UsersService, PermissionService],
  exports: [RoleService]
})
export class RolesModule {}
