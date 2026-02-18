import { Public } from '@edsy-services/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto';
import { SignUpResponse } from './types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() user: SignUpDto, @Req() req: Request): Promise<SignUpResponse> {
        return this.authService.signUp(user, req);
    }
}
