import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { UserRoleDto } from './dto/user-role.dto';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRoleDto]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, CaslAbilityFactory],
  exports: [UsersService]
})
export class UsersModule {}
