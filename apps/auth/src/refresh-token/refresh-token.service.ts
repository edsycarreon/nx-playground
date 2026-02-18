import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Kysely } from 'kysely';

import { DatabaseService } from '../database/services/database.service';
import { DB } from '../database/types/database.type';

import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';

@Injectable()
export class RefreshTokenService {
    private readonly logger = new Logger(RefreshTokenService.name);

    constructor(private readonly databaseService: DatabaseService) {}

    private get db(): Kysely<DB> {
        return this.databaseService.db;
    }

    public async create(payload: CreateRefreshTokenDto, req: Request): Promise<void> {
        const { personId, tokenHash, expiresAt, deviceType } = payload;
        const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
        const userAgent = req.headers['user-agent'];

        try {
            await this.db
                .insertInto('refresh_token')
                .values({
                    person_id: personId,
                    token_hash: tokenHash,
                    expires_at: expiresAt,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    device_name: deviceType?.deviceName,
                    device_type: deviceType?.deviceType,
                })
                .execute();
        } catch (error) {
            this.logger.error('Failed to create refresh token', error.stack);
            throw new InternalServerErrorException('Failed to create refresh token');
        }
    }
}
