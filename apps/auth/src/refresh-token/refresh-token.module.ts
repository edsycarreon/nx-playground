import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import authConfig from '../auth/config/auth.config';
import { UsersModule } from '../users/users.module';

import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenService } from './refresh-token.service';

@Module({
    imports: [ConfigModule.forFeature(authConfig), UsersModule, JwtModule],
    controllers: [RefreshTokenController],
    providers: [RefreshTokenService],
    exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
