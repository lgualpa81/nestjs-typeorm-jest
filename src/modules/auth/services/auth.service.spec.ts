import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UsersEntity } from '../../users/entities';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dto';
import { compareHashedText } from '../../../helpers';

jest.mock('../../../helpers', () => ({
  compareHashedText: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  let mockCompareHashedText: jest.Mock;

  const mockSignUpDto: RegisterDto = {
    name: 'Joe Doe',
    email: 'joe@example',
    password: 'password',
  };
  const mockLogin: LoginDto = {
    email: 'foo@test.com',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mockCompareHashedText = compareHashedText as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should return a new user without password if user creation succeeds', async () => {
      const mockUser = {
        id: 'uuid',
        ...mockSignUpDto,
        password: 'hashedPassword',
      } as unknown as UsersEntity;

      jest.spyOn(userService, 'findOneByEmail').mockReturnValue(null);
      jest.spyOn(userService, 'create').mockResolvedValueOnce(mockUser);

      const result = await authService.signUp(mockSignUpDto);
      const { password: _, ...data } = mockUser;

      expect(userService.create).toHaveBeenCalledWith(mockSignUpDto);
      expect(result).toEqual(data);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw an exception if email already exists', () => {
      const mockUser = {
        id: 'uuid',
        ...mockSignUpDto,
        password: 'hashedPassword',
      } as unknown as UsersEntity;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      const result = () => authService.signUp(mockSignUpDto);
      expect(result).rejects.toThrow(BadRequestException);
    });

    it('should throw an exception if user creation fails', () => {
      jest.spyOn(userService, 'findOneByEmail').mockReturnValue(null);
      jest.spyOn(userService, 'create').mockResolvedValueOnce(null);
      const result = () => authService.signUp(mockSignUpDto);
      expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException if email is incorrect', () => {
      const findOneByEmailSpy = jest
        .spyOn(userService, 'findOneByEmail')
        .mockResolvedValueOnce(null);
      const result = () => authService.signIn(mockLogin);

      expect(result).rejects.toThrow(UnauthorizedException);
      expect(result).rejects.toBeInstanceOf(UnauthorizedException);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockLogin.email, true);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockInvalidLogin: LoginDto = {
        email: 'foo@test.com',
        password: 'incorrectPassword',
      };
      const mockUser = {
        id: 'uuid',
        ...mockInvalidLogin,
        password: 'hashedPassword',
      } as unknown as UsersEntity;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      mockCompareHashedText.mockResolvedValueOnce(false);

      const result = authService.signIn(mockInvalidLogin);
      await expect(result).rejects.toThrow(UnauthorizedException);
      expect(mockCompareHashedText).toHaveBeenCalledWith(
        mockInvalidLogin.password,
        mockUser.password,
      );
    });

    it('should return an access token if credentials are valid', async () => {
      const mockUser = {
        id: 'uuid',
        ...mockLogin,
        password: 'hashedPassword',
      } as unknown as UsersEntity;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      mockCompareHashedText.mockResolvedValueOnce(true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('mockAccessToken');

      const result = await authService.signIn(mockLogin);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
      });
      expect(result).toEqual({ access_token: 'mockAccessToken' });
    });
  });
});
