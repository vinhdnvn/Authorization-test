import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { jwtConfig } from '@/common/config/jwt.config';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';

import { AccessToken } from './entities/access-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthService } from './services/auth.service';
import { BcryptService } from './services/bcrypt.service';
import { TokenService } from './services/token.service';
import { AuthController } from './auth.controller';
import { RoleService } from '../roles/role.service';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { PermissionService } from '../permissions/permission.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([AccessToken, RefreshToken, Role, Permission, User]),
    JwtModule.register({}),
    forwardRef(() => UsersModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService, BcryptService, ConfigService, RoleService, PermissionService],
  exports: [AuthService]
})
export class AuthModule {}
