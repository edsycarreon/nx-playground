import { CryptoUtils } from '@edsy-services/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserResponseDto } from '../users/dto';
import { toUserResponseDto } from '../users/mapper/users.mapper';
import { UsersService } from '../users/users.service';

import { SignUpDto } from './dto';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    public async signUp(user: SignUpDto): Promise<UserResponseDto> {
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

        const refreshToken = CryptoUtils.generateSecureToken();
        const hashedRefreshToken = CryptoUtils.sha256(refreshToken);

        return toUserResponseDto(createdUser);
    }
}
