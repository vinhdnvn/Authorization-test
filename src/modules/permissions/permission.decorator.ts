import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from './permisison.enum';

export const Permissions = (...permissions: PermissionEnum[]) => SetMetadata('permissions', permissions);
