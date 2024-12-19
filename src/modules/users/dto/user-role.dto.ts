import { Role } from '@/modules/roles/entities/role.entity';
import { User } from '../entities/user.entity';

// create user get role dto
export class UserRoleDto {
  role: Role;
  user: User;
}
