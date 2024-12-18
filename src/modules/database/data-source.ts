import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import 'reflect-metadata';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { UserPermissionsOverride } from '../permissions/entities/user-permission-override.entity';
import { RolePermission } from '../role-permission/role-permission.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { AccessToken } from '../auth/entities/access-token.entity';

config();

export const dataSourceOptions = {
  type: 'mysql' as any,
  host: process.env.MYSQL_HOST,
  port: +process.env.MYSQL_PORT,
  username: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: !!process.env.MYSQL_SYNCHRONIZE, // do not set it true in production application
  dropSchema: false,
  // entities: [Skill, Company, Resource, Permission, Role, User, TimeEntry, Token],
  entities: [
    'dist/modules/**/*.entity{.ts,.js}',
    User,
    Role,
    Permission,
    UserRole,
    UserPermissionsOverride,
    RolePermission,
    RefreshToken,
    AccessToken
  ],
  migrations: ['dist/modules/database/migrations/*{.ts,.js}', 'src/database/seeds/*.sql'],
  timezone: 'Z'
};

export default new DataSource(dataSourceOptions);
