import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role-create.dto';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
// import { RolePermission } from '../role-permission/role-permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  // Add role
  async addRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description } = createRoleDto;

    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new Error('Role already exists');
    }

    if (!name) {
      throw new Error('Role name is required');
    }

    const newRole = this.roleRepository.create({ name, description });
    return await this.roleRepository.save(newRole);
  }

  // Update role
  async updateRole(roleId: string, newName: string): Promise<any> {
    const role = await this.roleRepository.findOneBy({ id: Number(roleId) });

    if (!role) {
      throw new Error('Role not found');
    }

    role.name = newName;
    return await this.roleRepository.save(role);
  }

  // Delete role
  async deleteRole(roleId: string): Promise<any> {
    const role = await this.roleRepository.findOne({ where: { id: Number(roleId) } });

    if (!role) {
      throw new Error('Role not found');
    }

    return await this.roleRepository.remove(role);
  }

  // Get all roles
  async getRoles() {
    return await this.roleRepository.find();
  }

  // assign permission to role
  async assignPermissionToRole(roleId: number, permissionId: number) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    if (role.permissions.some((p) => p.id === permissionId)) {
      throw new Error('Permission is already assigned to this role');
    }

    role.permissions.push(permission);
    await this.roleRepository.save(role);

    return { message: 'Permission assigned successfully' };
  }

  // watch permisison  from role
  async getAllPermissionsFromRole(roleId: string): Promise<any> {
    const role = await this.roleRepository.findOne({ where: { id: Number(roleId) }, relations: ['permissions'] });
    return role.permissions;
  }

  // get permisison by user id
  async getPermissionByUserId(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.roles.map((role) => role.permissions).flat();
  }
}
