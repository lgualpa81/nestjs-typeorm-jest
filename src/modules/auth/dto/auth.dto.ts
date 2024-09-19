import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthBody } from '../../../interfaces';
import { Transform } from 'class-transformer';

export class AuthDTO implements AuthBody {
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  password: string;
}
