import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserDto } from './user.dto';
import { User } from '../entities/user.entity';

export class GetUserResponseDto extends OmitType(UserDto, ['password', 'userIds'] as const) {
  @Expose()
  id: string;

  constructor(partial: Partial<GetUserResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class UserResponseDto extends OmitType(UserDto, ['userIds'] as const) {}

export class UpdateUserBySelfResponseDto extends GetUserResponseDto {}

export class UpdateUserByAdminResponseDto extends GetUserResponseDto {
  @ApiProperty({
    example: 'User updated successfully',
    description: 'Message indicating the result of the update operation'
  })
  message: string;
}

export class GetTimeEntryUserResponseDto extends PartialType(PickType(GetUserResponseDto, ['fullName'])) {
  @Expose()
  id: string;
}

export class UserResponseRoleDto {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  gender: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  roles: string[]; // Array of role names

  @ApiProperty()
  overrides: any[]; // If you have this data
  password: string;
}
