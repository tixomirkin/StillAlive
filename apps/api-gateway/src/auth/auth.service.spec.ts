import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      userService.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' } as any);
      await expect(service.register({ email: 'test@test.com', password: 'password', name: 'Test' }))
        .rejects.toThrow(ConflictException);
    });

    it('should register successfully', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({ id: '1', email: 'test@test.com', name: 'Test', createdAt: new Date() } as any);
      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      const result = await service.register({ email: 'test@test.com', password: 'password', name: 'Test' });
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if wrong email', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'test@test.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if wrong password', async () => {
      const hash = await bcrypt.hash('different-password', 1);
      userService.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash } as any);
      await expect(service.login({ email: 'test@test.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully', async () => {
      const hash = await bcrypt.hash('password', 1);
      userService.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash, name: 'Test', createdAt: new Date() } as any);
      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      const result = await service.login({ email: 'test@test.com', password: 'password' });
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('generateTokens', () => {
    it('should return both tokens', async () => {
      jwtService.signAsync.mockResolvedValueOnce('access');
      jwtService.signAsync.mockResolvedValueOnce('refresh');
      configService.get.mockReturnValue('secret');

      const result = await service.generateTokens('1', 'test@test.com');
      expect(result.accessToken).toBe('access');
      expect(result.refreshToken).toBe('refresh');
    });
  });
});
