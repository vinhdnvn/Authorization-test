import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role-create.dto';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

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
    const role = await this.roleRepository.findOneBy({ id: Number(roleId) });
    if (!role) {
      throw new Error('Role not found');
    }
    return await this.roleRepository.remove(role);
  }

  // Get all roles
  async getRoles() {
    return await this.roleRepository.find();
  }
}
