import { IsNotEmpty, IsOptional, IsString, Max, MaxLength } from 'class-validator';

export class UpdateDtoPermission {
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
