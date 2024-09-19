import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ACCESS_LEVEL, ROLES } from '../../../constants/roles';
import { UsersEntity } from '../entities/users.entity';
import { ProjectsEntity } from '../../../modules/projects/entities';

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  // @ApiProperty()
  // @IsEnum(ROLES)
  // role: ROLES;
}

export class UpdateUserDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}

export class UserToProjectDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  user: UsersEntity;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  project: ProjectsEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ACCESS_LEVEL)
  accessLevel: ACCESS_LEVEL;
}
