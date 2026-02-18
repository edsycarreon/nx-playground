import { Public } from '@edsy-services/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshTokenService } from './refresh-token.service';

@Controller('refresh-token')
export class RefreshTokenController {
    constructor(private readonly refreshTokenService: RefreshTokenService) {}

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() payload: CreateRefreshTokenDto, @Req() req: Request): Promise<void> {
        return this.refreshTokenService.create(payload, req);
    }
}
