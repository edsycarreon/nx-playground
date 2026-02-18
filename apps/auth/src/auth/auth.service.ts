import { CryptoUtils, JwtToken } from '@edsy-services/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import type { StringValue } from 'ms';
import ms from 'ms';

import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UsersService } from '../users/users.service';

import { DeviceInfoDto, SignUpDto } from './dto';
import { SignUpResponse } from './types';

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

        const { accessToken, refreshToken } = await this.generateTokens(
            createdUser.id,
            req,
            user.deviceType,
        );

        return {
            user: createdUser,
            accessToken,
            refreshToken,
        };
    }

    private async generateTokens(
        personId: string,
        req: Request,
        device?: DeviceInfoDto,
    ): Promise<JwtToken> {
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
                deviceType: device,
            },
            req,
        );

        return { accessToken, refreshToken };
    }
}
