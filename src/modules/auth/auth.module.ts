import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../../modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envs } from '../../config/data-source';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
    //   JwtModule.registerAsync({
    //     imports: [ConfigModule],
    //     inject: [ConfigService],
    //     useFactory: (configService: ConfigService) => ({
    //       global: true,
    //       secret: configService.get('JWT_SECRET'),
    //       signOptions: { expiresIn: '2h' },
    //     })
    //   }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
