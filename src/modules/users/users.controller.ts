import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  SetMetadata,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import fs from 'fs';
import path from 'path';

import { RequestWithUser } from '@/common/types/index.e';

import { GetUserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { RegisterUserRequestDto } from './dto/user-request.dto';
import { UsersService } from './users.service';
import { UserRoleDto } from './dto/user-role.dto';
import { RoleEnum } from '../roles/enum/role.enum';
import { Roles } from '../roles/role.decorator';
import { Permission } from '../permissions/entities/permission.entity';
import { PermissionEnum } from '../permissions/permisison.enum';
import { PermissionsGuard } from '../permissions/guard/permission.guard';
import { CreateUserDto } from './dto/user-create.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Permissions } from '../permissions/permission.decorator';
import { Role } from '../roles/entities/role.entity';
import { RolesGuard } from '../roles/guard/role.guard';
@ApiTags('Users')
@Controller('users')
// @UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  @Get('profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the logged in user's details" })
  @ApiResponse({ status: 200, description: "Returns the logged in user's details", type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() { user }: RequestWithUser): Promise<GetUserResponseDto> {
    if (user.avatar && typeof user.avatar === 'string') {
      const avatarPath = path.join(process.cwd(), 'public', 'uploads', 'avatars', user.avatar);

      if (user.avatar && fs.existsSync(avatarPath)) {
        user.avatar = `${this.configService.get('BASE_URL')}/uploads/avatars/${user.avatar}`;
      } else {
        user.avatar = null;
      }
    }
    return plainToClass(GetUserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Post('/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createNewUser(@Body() createUserRequestDto: CreateUserDto): Promise<User> {
    return this.usersService.createNewUser(createUserRequestDto);
  }

  @Patch('/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the logged in user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateMe(@Req() { user }: RequestWithUser, @Body() updateUserRequestDto: any): Promise<User> {
    return this.usersService.updateProfile(user.id, updateUserRequestDto);
  }

  // get all role associated user by id userid from Body
  @Get(':userId/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all roles associated with the user by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user whose roles you want to fetch',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: 'Return all roles associated with the user', type: [User] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getRoles(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getAllRolesUser(userId);
  }

  // @Roles(RoleEnum.ADMIN)
  @Post(':userId/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a role to the user by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user to whom you want to assign a role',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: 'Role successfully assigned to the user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async assignRole(@Param('userId') userId: string, @Body() body: { roleId: string }): Promise<any> {
    // Validate body payload
    if (!body.roleId) {
      throw new BadRequestException('role_id_required');
    }

    await this.usersService.assignRoleToUser(userId, Number(body.roleId));
    return { message: 'Role successfully assigned to the user' };
  }

  @Delete(':userId/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a role from the user by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user from whom you want to remove a role',
    required: true,
    type: String
  })
  async removeRole(@Param('userId') userId: string, @Body() body: { roleId: string }): Promise<any> {
    return this.usersService.removeRoleFromUser(userId, Number(body.roleId));
  }

  // test area -----------------------------------------------------------------------------------------------------
  // find user by id
  @Post('/:id')
  @Roles(RoleEnum.USER)
  @Permissions(PermissionEnum.READ)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PermissionEnum.READ)
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id, [
      'roles'
      // 'roles.role',
      // 'roles.role.permissions.permission',
      // 'overrides'
    ]);
  }

  @Get('/:id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PermissionEnum.READ)
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id, ['roles']);
  }

  @Get('/permission')
  @Permissions(PermissionEnum.READ)
  async getPermission(@Body() body: { userId: string }) {
    return this.usersService.getPermissionsByUserId(body.userId);
  }
}
