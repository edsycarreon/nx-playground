import { Public } from '@edsy-services/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { UserResponseDto } from '../users/dto';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() user: SignUpDto): Promise<UserResponseDto> {
        return this.authService.signUp(user);
    }
}
