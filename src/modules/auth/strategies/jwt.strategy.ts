import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '@/common/types/index.e';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

import { TokenService } from '../services/token.service';
import { RoleService } from '@/modules/roles/role.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly rolesService: RoleService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: TokenPayload): Promise<User> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const currentTime = Date.now() / 1000;
    if (payload.exp < currentTime) {
      throw new UnauthorizedException('auth.errors.unauthorized');
    }

    const isExistAccessToken = await this.tokenService.isExistAccessToken(token);

    if (!isExistAccessToken) {
      throw new UnauthorizedException('auth.errors.unauthorized');
    }

    const isTokenRevoked = await this.tokenService.isAccessTokenRevoked(token);

    if (isTokenRevoked) {
      throw new UnauthorizedException('auth.errors.unauthorized');
    }

    const isValidAccessToken = await this.tokenService.verifyAccessToken(token);

    if (!isValidAccessToken) {
      throw new UnauthorizedException('auth.errors.unauthorized');
    }

    const user = await this.usersService.findUserById(payload.userId);

    const roles = await this.usersService.getAllRolesUser(user.id);

    // const permissions = await this.rolesService.getAllPermissionsFromRole(user.id);

    if (!user) {
      throw new UnauthorizedException('auth.errors.unauthorized');
    }

    // const permisison = await this.rolesService.getAllPermissionsFromRole(user.id);

    // if (!permisison) {
    //   throw new UnauthorizedException('auth.errors.unauthorized');
    // }

    // gán role vào user để sử dụng trong role guard

    user.roles = roles.map((role) => role.name);

    // gán permission vào user để sử dụng trong permission guard
    // roles. = permisison.map((perm) => perm.name);

    console.log('user in jwt strategy', user);

    return user;
  }
}
