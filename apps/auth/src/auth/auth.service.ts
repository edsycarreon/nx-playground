import { CryptoUtils, JwtToken } from '@edsy-services/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { SignUpDto } from './dto';
import { SignUpResponse } from './types';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;
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

        const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);

        const createdUser = await this.userService.create({
            email: user.email,
            passwordHash: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        const { accessToken, refreshToken } = await this.generateTokens(createdUser.id);

        return {
            user: createdUser,
            accessToken,
            refreshToken,
        };
    }

    private generateTokens(email: string): JwtToken {
        const accessToken = this.jwtService.sign(
            {
                sub: email,
            },
            {
                secret: 'sample secret',
                expiresIn: '1h',
            },
        );
        const refreshToken = CryptoUtils.generateSecureToken();
        // const hashedRefreshToken = CryptoUtils.sha256(refreshToken);

        return { accessToken, refreshToken };
    }
}
