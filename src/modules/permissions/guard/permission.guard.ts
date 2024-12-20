import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionEnum } from '../permisison.enum';
import { RoleEnum } from '@/modules/roles/enum/role.enum';
import { RoleService } from '@/modules/roles/role.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionService } from '../permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  
    // private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<PermissionEnum[]>('permissions', context.getHandler());
    const requiredRoles = this.reflector.get<RoleEnum[]>('roles', context.getHandler());

    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    // const permisisons = await this.(userId);

    return true;
  }
}
