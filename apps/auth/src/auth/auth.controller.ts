import { Public } from '@edsy-services/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { SignInResponse, SignUpResponse } from './types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() user: SignUpDto, @Req() req: Request): Promise<SignUpResponse> {
        return this.authService.signUp(user, req);
    }

    @Public()
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signin(@Body() user: SignInDto, @Req() req: Request): Promise<SignInResponse> {
        return this.authService.signIn(user, req);
    }
}
