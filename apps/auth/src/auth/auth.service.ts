import { ConflictException, Injectable, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { toUserResponseDto } from '../users/mapper/users.mapper';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    async signIn(user: SignInDto) {
        return 'sign in endpoiint';
    }

    async signUp(user: SignUpDto) {
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

        return toUserResponseDto(createdUser);
    }
}
