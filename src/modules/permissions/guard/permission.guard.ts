import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User } from '@/modules/users/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/modules/roles/entities/user-role.entity';
import { CaslAbilityFactory } from '@/modules/casl/casl-ability.factory';
import { PermissionEnum } from '../permisison.enum';
import { RoleEnum } from '@/modules/roles/enum/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const handler = context.getHandler();

    // Get the required permission from the handler metadata
    const requiredPermission: PermissionEnum = this.reflector.get(
      'permission',
      handler
    );

    // Retrieve roles and permissions for the user
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: user.id } },
      relations: ['role']
    });

    const role = userRoles[0]?.role?.name as RoleEnum;

    // Get the ability (permissions) for the user
    const abilities = CaslAbilityFactory.defineAbilitiesFor(role, [
      requiredPermission
    ]);

    // Check if the user has the required permission
    return abilities.can('manage', requiredPermission);
  }
}
