import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, CanActivate } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users.service';
import { AuthGuard } from '../guards/auth.guard';
import { LoginDto, RegisterDto } from '../dto';
import { UsersEntity } from 'src/modules/users/entities';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let authGuard: CanActivate;

  const mockLogin: LoginDto = {
    email: 'foo@test.com',
    password: 'password',
  };
  const mockSignUpDto: RegisterDto = {
    name: 'Joe Doe',
    email: 'joe@example',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            // create: jest.fn(),
            // findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            // signAsync: jest.fn(),
            // verifyAsync: jest.fn(),
          },
        },
        // {
        //   provide: AuthGuard,
        //   useValue: {
        //     canActivate: jest.fn((context: ExecutionContext) => {
        //       const req = context.switchToHttp().getRequest();
        //       req.user = { userId: '123', username: 'testuser' };
        //       return true;
        //     }),
        //   },
        // },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call signUp service when call signUp controller', async () => {
      const mockUser = {
        id: 'uuid',
      } as unknown as UsersEntity;

      jest.spyOn(authService, 'signUp').mockResolvedValue(mockUser);
      const result = await authController.signUp(mockSignUpDto);

      expect(authService.signUp).toHaveBeenCalledWith(mockSignUpDto);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('signIn', () => {
    it('should call signIn service when call login controller', async () => {
      const mockToken = { access_token: 'mockAccessToken' };

      jest.spyOn(authService, 'signIn').mockResolvedValueOnce(mockToken);
      const result = await authController.signIn(mockLogin);

      expect(authService.signIn).toHaveBeenCalledWith(mockLogin);
      expect(result).toHaveProperty('access_token');
      expect(result).toEqual(mockToken);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile from the request', () => {
      const req = { user: { userId: '123', username: 'testuser' } };
      const result = authController.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });
});
