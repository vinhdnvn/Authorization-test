import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/role-create.dto';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  // get role

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async getRoles() {
    return this.roleService.getRoles();
  }

  // add role
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new Role' })
  @ApiResponse({ status: 200, description: 'Create new Role successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async addRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.addRole(createRoleDto);
  }

  // update role
  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateRole(@Param('id') id: string, @Body('newName') newName: string): Promise<Role> {
    return this.roleService.updateRole(id, newName);
  }

  // delete role
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete the role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete('/:id')
  async deleteRole(@Param('id') id: string): Promise<any> {
    return this.roleService.deleteRole(id);
  }

  // assign permission to role
  @Post(':roleId/permission')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a permission to role by roleId' })
  @ApiParam({
    name: 'roleId',
    description: 'The unique identifier of the role to which you want to assign a permission',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: '  Permission successfully assigned to the role' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @Post(':roleId/permissions')
  async assignPermissionToRole(
    @Param('roleId') roleId: number, // Lấy roleId từ Param
    @Body('permissionId') permissionId: number // Lấy permissionId từ Body
  ) {
    await this.roleService.assignPermissionToRole(roleId, permissionId);
    return { message: 'Permission assigned successfully to role' };
  }

  // watch permission role
  @Get(':roleId/permission')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all permissions associated with the role by role ID' })
  @ApiParam({
    name: 'roleId',
    description: 'The unique identifier of the role whose permissions you want to fetch',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: 'Return all permissions associated with the role' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getPermissions(@Param('roleId') roleId: string): Promise<any> {
    return this.roleService.getAllPermissionsFromRole(roleId);
  }

  // get permission from user, userId in Body
  @Get('/permissionUser')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all permissions associated with the user by user ID' })
  async getPermissionsUser(@Body() body: { userId: string }): Promise<any> {
    return this.roleService.getPermissionByUserId(body.userId);
  }
}
