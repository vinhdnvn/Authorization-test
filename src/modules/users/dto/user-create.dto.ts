import { RoleEnum } from '@/modules/roles/enum/role.enum';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  full_name: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  gender: number;

  @IsOptional()
  address: string;

  @IsOptional()
  avatar: string;

  @IsOptional()
  status: number;
  // role have default value  RoleEnum.USER
  @IsString()
  @IsNotEmpty()
  role: RoleEnum;
}
