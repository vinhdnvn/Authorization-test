import { Ability, AbilityBuilder } from '@casl/ability';
import { PermissionEnum } from '../permissions/permisison.enum';
import { RoleEnum } from '../roles/enum/role.enum';

export type AppAbility = Ability<[string, string]>; // [Action, Resource]

export class CaslAbilityFactory {
  static defineAbilitiesFor(role: RoleEnum, permissions: PermissionEnum[]) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

    switch (role) {
      case RoleEnum.ADMIN:
        can('manage', 'all');
        break;
      case RoleEnum.USER:
        can('read', 'all');
        if (permissions.includes(PermissionEnum.CREATE)) {
          can('create', 'all');
        }
        if (permissions.includes(PermissionEnum.UPDATE)) {
          can('update', 'all');
        }
        if (permissions.includes(PermissionEnum.DELETE)) {
          can('delete', 'all');
        }
        break;
      case RoleEnum.GUEST:
        // if (permissions.includes(PermissionEnum.READ)) {
        //   can('read', 'all');
        // }
        can('read', 'all');
        break;
      case RoleEnum.SUPER_ADMIN:
        can('manage', 'all');
        break;
    }

    return build();
  }
}
