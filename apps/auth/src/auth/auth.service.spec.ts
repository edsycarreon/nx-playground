import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';

import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    isEmailVerified: false,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: null,
};

const mockUserWithCredentials = {
    ...mockUser,
    passwordHash: 'hashed_password',
};

const mockRequest = {
    ip: '127.0.0.1',
    headers: {
        'user-agent': 'test-agent',
    },
} as unknown as Request;

describe('AuthService', () => {
    let service: AuthService;
    let mockFindByEmail: jest.Mock;
    let mockFindCredentialsByEmail: jest.Mock;
    let mockCreateUser: jest.Mock;
    let mockCreateRefreshToken: jest.Mock;

    beforeEach(async () => {
        mockFindByEmail = jest.fn();
        mockFindCredentialsByEmail = jest.fn();
        mockCreateUser = jest.fn();
        mockCreateRefreshToken = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: mockFindByEmail,
                        findCredentialsByEmail: mockFindCredentialsByEmail,
                        create: mockCreateUser,
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: Record<string, unknown> = {
                                'auth.jwtSecret': 'test-secret',
                                'auth.jwtAccessExpiration': '15m',
                                'auth.jwtRefreshExpiration': '7d',
                            };
                            return config[key];
                        }),
                        getOrThrow: jest.fn((key: string) => {
                            const config: Record<string, unknown> = {
                                'auth.hashSaltRounds': 10,
                            };
                            return config[key];
                        }),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock_access_token'),
                    },
                },
                {
                    provide: RefreshTokenService,
                    useValue: { create: mockCreateRefreshToken },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('signUp', () => {
        const signUpDto = {
            email: 'test@example.com',
            password: 'securepassword',
            firstName: 'John',
            lastName: 'Doe',
        };

        it('should create user and return tokens on successful signup', async () => {
            mockFindByEmail.mockResolvedValue(null);
            mockCreateUser.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockCreateRefreshToken.mockResolvedValue(undefined);

            const result = await service.signUp(signUpDto, mockRequest);

            expect(result.user).toEqual(mockUser);
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(mockCreateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: signUpDto.email,
                    passwordHash: 'hashed_password',
                    firstName: signUpDto.firstName,
                    lastName: signUpDto.lastName,
                }),
            );
        });

        it('should throw ConflictException when email already exists', async () => {
            mockFindByEmail.mockResolvedValue(mockUser);

            await expect(service.signUp(signUpDto, mockRequest)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.signUp(signUpDto, mockRequest)).rejects.toThrow(
                'User already exists.',
            );
            expect(mockCreateUser).not.toHaveBeenCalled();
        });
    });

    describe('signIn', () => {
        const signInDto = {
            email: 'test@example.com',
            password: 'securepassword',
        };

        it('should return user and tokens on successful signin', async () => {
            mockFindCredentialsByEmail.mockResolvedValue(mockUserWithCredentials);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockCreateRefreshToken.mockResolvedValue(undefined);

            const result = await service.signIn(signInDto, mockRequest);

            expect(result.user).toEqual(mockUser);
            expect(result.user).not.toHaveProperty('passwordHash');
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockFindCredentialsByEmail.mockResolvedValue(null);

            await expect(service.signIn(signInDto, mockRequest)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.signIn(signInDto, mockRequest)).rejects.toThrow('User not found');
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            mockFindCredentialsByEmail.mockResolvedValue(mockUserWithCredentials);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.signIn(signInDto, mockRequest)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.signIn(signInDto, mockRequest)).rejects.toThrow(
                'Invalid credentials.',
            );
        });
    });
});
