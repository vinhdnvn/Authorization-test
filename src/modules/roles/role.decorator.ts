import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "./enum/role.enum";

export const ROLE_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles); 
