import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { TLanguage } from '@/common/types/index.e';

import { RegisterUserRequestDto } from './dto/user-request.dto';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { RoleEnum } from '../roles/enum/role.enum';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>
  ) {}

  /**
   * Tạo người dùng mới
   * @param lang - Ngôn ngữ
   * @param createUserRequestDto - Dữ liệu tạo người dùng
   * @returns Người dùng mới được tạo
   */
  //! cần update lại để không phụ thuộc các service với nhau
  async createNewUser(createUserRequestDto: CreateUserDto): Promise<User> {
    const { ...userDto } = createUserRequestDto;

    const newUser = this.usersRepository.create({ ...userDto, fullName: userDto.full_name || 'Anonymous' });

    return this.usersRepository.save(newUser);
  }

  /**
   * Tìm người dùng bằng email
   * @param email - Email của người dùng
   * @returns Người dùng tìm thấy
   */
  async findUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Tìm người dùng bằng ID
   * @param lang - Ngôn ngữ
   * @param id - ID của người dùng
   * @returns Người dùng tìm thấy
   */
  async findUserById(id: string, relations: string[] = []): Promise<User> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('invalid_id');
    }

    const user = await this.usersRepository.findOne({ where: { id }, relations });

    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    return user;
  }

  /**
   * Tìm danh sách người dùng theo danh sách ID
   *
   * @param lang - Ngôn ngữ cần sử dụng để trả về thông báo lỗi (nếu có).
   * @param ids - Danh sách các ID của người dùng cần tìm.
   * @returns Một mảng người dùng chứa thông tin của người dùng
   */
  async findUsersByIds(ids: string[], relations: string[] = []): Promise<User[]> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('invalid_ids');
    }

    const users = await this.usersRepository.find({
      where: { id: In(ids) },
      relations: relations
    });

    if (users.length === 0) {
      throw new NotFoundException('user.not_found');
    }

    return users;
  }

  /**
   * Cập nhật mật khẩu của người dùng
   * @param lang - Ngôn ngữ
   * @param id - ID của người dùng
   * @param newPassword - Mật khẩu mới
   * @returns Người dùng đã được cập nhật
   */
  async updatePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findUserById(id);
    user.password = newPassword;
    return this.usersRepository.save(user);
  }

  async updateProfile(id: string, data: any): Promise<User> {
    const user = await this.findUserById(id);
    user.fullName = data.fullName;
    user.phone = data.phone;
    user;
    return this.usersRepository.save(user);
  }

  // watch user role
  async getAllRolesUser(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.role'] // Include the role entity
    });

    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    return {
      ...user,
      roles: user.roles.map((userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        createdAt: userRole.createdAt,
        updatedAt: userRole.updatedAt
      }))
    };
  }

  // assign new role to user by user id
  // Assign new role to user by user ID
  async assignRoleToUser(userId: string, roleId: number): Promise<any> {
    // Find the user by ID
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    // Find the role entity by ID
    const roleEntity = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!roleEntity) {
      throw new BadRequestException('role_not_found');
    }

    // Check if the user already has this role
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { user: { id: userId }, role: { id: roleEntity.id } }
    });
    if (existingUserRole) {
      throw new BadRequestException('user_already_has_this_role');
    }

    // Create and save the new role for the user
    try {
      const userRole = this.userRoleRepository.create({
        user,
        role: roleEntity
      });
      return await this.userRoleRepository.save(userRole);
    } catch (error) {
      throw new BadRequestException('assign_role_failed');
    }
  }

  // remove role from user by user id and roleId
  async removeRoleFromUser(userId: string, roleId: number): Promise<any> {
    // Find the user by ID
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    // Find the role entity by ID
    const roleEntity = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!roleEntity) {
      throw new BadRequestException('role_not_found');
    }

    // Check if the user has this role
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { user: { id: userId }, role: { id: roleEntity.id } }
    });
    if (!existingUserRole) {
      throw new BadRequestException('user_does_not_have_this_role');
    }

    // Remove the role from the user
    try {
      return await this.userRoleRepository.remove(existingUserRole);
    } catch (error) {
      throw new BadRequestException('remove_role_failed');
    }
  }
}
