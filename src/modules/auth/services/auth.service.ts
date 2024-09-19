import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto, RegisterDto } from '../dto';
import { UsersEntity } from '../../../modules/users/entities';
import { compareHashedText } from '../../../helpers';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(payload: LoginDto) {
    const user: UsersEntity = await this.userService.findOneByEmail(
      payload.email,
      true,
    );
    if (!user) throw new UnauthorizedException();

    const isValidPassword: boolean = await compareHashedText(
      payload.password,
      user.password,
    );
    if (!isValidPassword) throw new UnauthorizedException();

    const token = { role: user.role, id: user.id };
    return {
      access_token: await this.jwtService.signAsync(token),
    };
  }

  async signUp(payload: RegisterDto) {
    const user: UsersEntity = await this.userService.findOneByEmail(
      payload.email,
    );
    if (user) throw new BadRequestException('User already exists');
    const register: UsersEntity = await this.userService.create(payload);
    if (!register) throw new InternalServerErrorException();

    const { password: _, ...rest } = register;
    return rest;
  }
}
