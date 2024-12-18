import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
}
