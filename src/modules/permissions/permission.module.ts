import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Permission } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), forwardRef(() => AuthModule)],
  controllers: [PermissionController],
  providers: [ConfigService, PermissionService],
  exports: [PermissionService]
})
export class PermissionsModule {}
