import { CryptoUtils, JwtToken } from '@edsy-services/common';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import type { StringValue } from 'ms';
import ms from 'ms';

import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UsersService } from '../users/users.service';

import { SignInDto, SignUpDto } from './dto';
import { SignInResponse, SignUpResponse } from './types';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly refreshTokenService: RefreshTokenService,
    ) {}

    public async signUp(user: SignUpDto, req: Request): Promise<SignUpResponse> {
        const existingUser = await this.userService.findByEmail(user.email);

        if (existingUser) {
            throw new ConflictException('User already exists.');
        }

        const saltRounds = this.configService.getOrThrow<number>('auth.hashSaltRounds');
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        const createdUser = await this.userService.create({
            email: user.email,
            passwordHash: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        const { accessToken, refreshToken } = await this.generateTokens(createdUser.id, req);

        return {
            user: createdUser,
            accessToken,
            refreshToken,
        };
    }

    public async signIn(user: SignInDto, req: Request): Promise<SignInResponse> {
        const existingUser = await this.userService.findCredentialsByEmail(user.email);

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        if (existingUser.lockedUntil && existingUser.lockedUntil > new Date()) {
            throw new ForbiddenException('Account is temporarily locked. Try again later.');
        }

        if (existingUser.lockedUntil && existingUser.lockedUntil <= new Date()) {
            await this.userService.resetFailedLoginAttempts(existingUser.id);
        }

        const isPasswordValid = await bcrypt.compare(user.password, existingUser.passwordHash);

        if (!isPasswordValid) {
            await this.userService.incrementFailedLoginAttempts(existingUser.id);
            throw new UnauthorizedException('Invalid credentials.');
        }

        await this.userService.resetFailedLoginAttempts(existingUser.id);

        const { accessToken, refreshToken } = await this.generateTokens(existingUser.id, req);

        const { passwordHash: _, lockedUntil: __, ...userWithoutPassword } = existingUser;

        await this.userService.updateLastSignedIn(existingUser.id);

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    private async generateTokens(personId: string, req: Request): Promise<JwtToken> {
        const secret = this.configService.get<string>('auth.jwtSecret');
        const expiresIn = this.configService.get<StringValue>(
            'auth.jwtAccessExpiration',
            '15m' as StringValue,
        );
        const refreshExpiry = this.configService.get<string>('auth.jwtRefreshExpiration');

        const accessToken = this.jwtService.sign(
            {
                sub: personId,
            },
            {
                secret,
                expiresIn,
            },
        );
        const refreshToken = CryptoUtils.generateSecureToken();
        const hashedRefreshToken = CryptoUtils.sha256(refreshToken);

        await this.refreshTokenService.create(
            {
                personId,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + ms(refreshExpiry as StringValue)),
            },
            req,
        );

        return { accessToken, refreshToken };
    }
}
