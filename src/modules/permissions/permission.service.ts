import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/permission-create.dto';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  // Add permission
  async addPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, description } = createPermissionDto;

    // Check for duplicate permission
    const existingPermission = await this.permissionRepository.findOne({ where: { name } });
    if (existingPermission) {
      throw new BadRequestException('Permission already exists');
    }

    // Ensure `name` is not null
    if (!name) {
      throw new BadRequestException('Permission name is required');
    }

    // Create and save new permission
    const newPermission = this.permissionRepository.create({ name, description });
    return await this.permissionRepository.save(newPermission);
  }

  // Update permission
  async updatePermission(permissionId: string, newName: string): Promise<any> {
    const permission = await this.permissionRepository.findOneBy({ id: Number(permissionId) });
    if (!permission) {
      throw new Error('Permission not found');
    }

    permission.name = newName;
    return await this.permissionRepository.save(permission);
  }

  // Delete permission
  async deletePermission(permissionId: string): Promise<any> {
    const permission = await this.permissionRepository.findOneBy({ id: Number(permissionId) });
    if (!permission) {
      throw new Error('Permission not found');
    }

    return await this.permissionRepository.remove(permission);
  }

  // Get all permissions

  async getPermissions() {
    return await this.permissionRepository.find();
  }

  // assign permission to role
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<any> {
    const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    if (!role.permissions) {
      return { message: 'Role does not have any permissions' };
    }

    await this.roleRepository
      .createQueryBuilder()
      .insert()
      .into('role_permissions') // Tên bảng trung gian
      .values({
        role_id: roleId, // Cột role_id trong bảng role_permissions
        permission_id: permissionId // Cột permission_id trong bảng role_permissions
      })
      .execute();

    return { roleId, permissionId, message: 'Permission assigned successfully' };
  }

  async getPermissionsByUserId(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions']
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user.roles.map((role) => role.permissions).flat();
  }
}
