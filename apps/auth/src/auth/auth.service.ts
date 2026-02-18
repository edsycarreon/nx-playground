import { CryptoUtils, JwtToken } from '@edsy-services/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';

import { UsersService } from '../users/users.service';

import { SignUpDto } from './dto';
import { SignUpResponse } from './types';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    public async signUp(user: SignUpDto): Promise<SignUpResponse> {
        const existingUser = await this.userService.findByEmail(user.email);

        if (existingUser) {
            throw new ConflictException('User already exists.');
        }

        const hashedPassword = await bcrypt.hash(
            user.password,
            this.configService.getOrThrow('auth.hashSaltRounds'),
        );

        const createdUser = await this.userService.create({
            email: user.email,
            passwordHash: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        const { accessToken, refreshToken } = this.generateTokens(createdUser.id);

        return {
            user: createdUser,
            accessToken,
            refreshToken,
        };
    }

    private generateTokens(userId: string): JwtToken {
        const secret = this.configService.get<string>('auth.jwtSecret');
        const expiresIn = this.configService.get<StringValue>(
            'auth.jwtAccessExpiration',
            '15m' as StringValue,
        );
        const accessToken = this.jwtService.sign(
            {
                sub: userId,
            },
            {
                secret,
                expiresIn,
            },
        );
        const refreshToken = CryptoUtils.generateSecureToken();
        // const hashedRefreshToken = CryptoUtils.sha256(refreshToken);

        //TODO: Implement the refresh token service

        return { accessToken, refreshToken };
    }
}
