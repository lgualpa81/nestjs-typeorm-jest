import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
