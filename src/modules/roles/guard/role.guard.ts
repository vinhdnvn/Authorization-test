import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs'; // Path to your UserRole Entity
// Path to your UserService

import { RoleEnum } from '../enum/role.enum';
import { ROLE_KEY } from '../role.decorator';

import { PermissionService } from '@/modules/permissions/permission.service';
import { PermissionEnum } from '@/modules/permissions/permisison.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly userService: UsersService // Inject UserService to fetch roles for a user
    private readonly permissionService: PermissionService
  ) {}

  private hasRequiredPermissions(userPermissions: string[], requiredPermissions: PermissionEnum[]): boolean {
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }

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

    const requiredPermissions = this.reflector.getAll<PermissionEnum[]>('permissions', [
      context.getHandler(),
      context.getClass()
    ]);

    if (requiredPermissions) {
      return this.permissionService.getPermissionsByUserId(user.id).then((permissions) => {
        const userPermissionNames = permissions.map((p) => p.name); // Extract `name` from the array
        const flatRequiredPermissions = requiredPermissions.flat();
        console.log('userPermissionNames', userPermissionNames);
        console.log('requiredPermissions', requiredPermissions);
        return requiredPermissions.some((permissionSet) => {
          // If permissionSet is undefined, skip it
          if (!permissionSet) {
            return true;
          }
          console.log('permissionSet', permissionSet);

          // Convert permissionSet to array if it's not already
          const permissions = Array.isArray(permissionSet) ? permissionSet : [permissionSet];
          console.log('permissions', permissions);
          // Check if user has ALL permissions in this set
          return permissions.every((permission) => userPermissionNames.includes(permission));
        });
      });
    }
    console.log('requiredRole', requiredRole);
    if (!requiredRole) {
      return true;
    }

    return roles.some((role) => user.roles.includes(role)); // Kiểm tra role có khớp không
  }
}
