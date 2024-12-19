import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Permission } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RoleService } from '../roles/role.service';
import { UserRoleDto } from '../users/dto/user-role.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, User, UserRoleDto]), forwardRef(() => AuthModule)],
  controllers: [PermissionController],
  providers: [ConfigService, PermissionService, UsersService, RoleService],
  exports: [PermissionService]
})
export class PermissionsModule {}
