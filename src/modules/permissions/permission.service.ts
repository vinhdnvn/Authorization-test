import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/permission-create.dto';

@Injectable()
export class PermissionService {
  constructor(@InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>) {}

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
}
