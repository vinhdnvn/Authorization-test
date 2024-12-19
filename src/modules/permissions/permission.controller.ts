import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { create } from 'domain';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/permission-create.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  // get permission
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Return all permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async getPermissions() {
    return this.permissionService.getPermissions();
  }

  // add permission
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new permission' })
  @ApiParam({ name: 'name', required: true })
  @ApiResponse({ status: 201, description: 'Permission added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Post()
  async addPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.addPermission(createPermissionDto);
  }

  // update permission
  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the permission' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updatePermission(@Param('id') id: string, @Body('newName') newName: string): Promise<Permission> {
    return this.permissionService.updatePermission(id, newName);
  }

  // delete permission
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete the permission' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deletePermission(@Param('id') id: string): Promise<any> {
    return this.permissionService.deletePermission(id);
  }

  // assign permission to role
  @Post('/:roleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a permission to role by roleId' })
  @ApiParam({
    name: 'roleId',
    description: 'The unique identifier of the role to which you want to assign a permission',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: 'Permission successfully assigned to the role' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async assignPermissionToRole(@Param('roleId') roleId: number, @Body('permissionId') permissionId: number) {
    await this.permissionService.assignPermissionToRole(roleId, permissionId);
    return { message: 'Permission assigned successfully to role' };
  }

  // watch permission role by Userid body
  @Get('/user')
  async watchPermissionRole(@Body() body: { userId: string }) {
    return this.permissionService.getPermissionsByUserId(body.userId);
  }
}
