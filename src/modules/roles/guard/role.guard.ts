import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs'; // Path to your UserRole Entity
// Path to your UserService
import { UsersService } from '@/modules/users/users.service';
import { RoleEnum } from '../enum/role.enum';
import { ROLE_KEY } from '../role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService // Inject UserService to fetch roles for a user
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // log user in role guard

    console.log('user in role guard', user);
    const roles = this.reflector.get<RoleEnum[]>(ROLE_KEY, context.getHandler());
    if (!roles) {
      return true;
    }

    // nếu role là super_admin thì cho qua luôn
    if (roles.includes(RoleEnum.SUPER_ADMIN)) {
      return true;
    }

    console.log('User roles:', user.roles);

    const requiredRole = this.reflector.getAll<RoleEnum[]>(ROLE_KEY, [context.getHandler(), context.getClass()]);

    console.log('requiredRole', requiredRole);
    if (!requiredRole) {
      return true;
    }

    return roles.some((role) => user.roles.includes(role)); // Kiểm tra role có khớp không
  }
}
