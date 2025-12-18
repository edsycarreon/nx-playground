import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '@edsy-services/decorators';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signIn')
    signIn(@Body() user: SignInDto) {
        return this.authService.signIn(user);
    }

    @Public()
    @Post('signup')
    @HttpCode(201)
    signup(@Body() user: SignUpDto) {
        return this.authService.signUp(user);
    }
}
