import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  password: string;
}
