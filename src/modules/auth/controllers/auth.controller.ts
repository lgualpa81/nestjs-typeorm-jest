import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from '../dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signUp(@Body() payload: RegisterDto) {
    return this.authService.signUp(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() payload: LoginDto) {
    return this.authService.signIn(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
