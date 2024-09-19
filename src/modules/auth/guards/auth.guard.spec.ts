import { TestingModule, Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let context: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const result = () => authGuard.canActivate(context);
      expect(result).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const invalidTokenContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer invalidToken',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('invalid token'));
      const result = () => authGuard.canActivate(invalidTokenContext);
      expect(result).rejects.toThrow(UnauthorizedException);
    });

    it('should set the user property in request if token is valid', async () => {
      const mockPayload = { userId: '123', username: 'testuser' };
      const validTokenContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer validToken',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(validTokenContext);
      expect(result).toBeTruthy();

      const request = validTokenContext.switchToHttp().getRequest();
      expect(request['user']).toEqual(mockPayload);
    });
  });
});
