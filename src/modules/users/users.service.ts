import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { TLanguage } from '@/common/types/index.e';

import { RegisterUserRequestDto } from './dto/user-request.dto';
import { User } from './entities/user.entity';
// import { UserRole } from '../roles/entities/user-role.entity';
import { RoleEnum } from '../roles/enum/role.enum';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/user-create.dto';
import { UserRoleDto } from './dto/user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRoleDto) private readonly userRoleRepository: Repository<UserRoleDto>,
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

    const newUser = this.usersRepository.create({
      ...userDto,
      fullName: userDto.full_name || 'Anonymous',
      // gắn role mặc định cho user
      roles: [Object.assign(new Role(), { id: RoleEnum.USER })]
    });

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
    // Kiểm tra id có hợp lệ hay không
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new BadRequestException('Invalid user ID');
    }

    // Tìm kiếm user với các quan hệ chỉ định
    const user = await this.usersRepository.findOne({
      where: { id },
      relations
    });

    // Nếu không tìm thấy user, ném ngoại lệ
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
    const user = await this.findUserById(userId, ['roles']);
    return user.roles;
  }

  // assign new role to user by user id
  // Assign new role to user by user ID
  async assignRoleToUser(userId: string, roleId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'] // Tải roles liên quan
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Kiểm tra nếu user đã có role này chưa
    if (user.roles.some((userRole) => userRole.id === role.id)) {
      throw new NotFoundException('User already has this role');
    }

    // Gán role cho user
    user.roles.push(role);

    // Lưu lại vào database
    await this.usersRepository.save(user);

    return { message: 'Role assigned successfully to the user' };
  }

  // remove role from user by user id and roleId
  async removeRoleFromUser(userId: string, roleId: number): Promise<any> {
    // Find the user by ID
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    // If the user is not found, throw an error
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the role by ID
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    // If the role is not found, throw an error
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Remove the role from the user
    user.roles = user.roles.filter((userRole) => userRole.id !== role.id);

    // Save the changes to the database
    await this.usersRepository.save(user);
    return { message: 'Role removed successfully from the user' };
  }

  async getPermissionsByUserId(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions']
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles.map((role) => role.permissions).flat();
  }
}
