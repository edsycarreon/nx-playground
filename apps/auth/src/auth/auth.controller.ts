import { Public } from '@edsy-services/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto';
import { SignUpResponse } from './types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() user: SignUpDto): Promise<SignUpResponse> {
        return this.authService.signUp(user);
    }
}
