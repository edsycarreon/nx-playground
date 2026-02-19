import { GetUserResponse, handleDatabaseError, MAX_LOGIN_ATTEMPTS } from '@edsy-services/common';
import { Injectable, Logger } from '@nestjs/common';
import { addDays } from 'date-fns';
import { Kysely, sql } from 'kysely';

import { GetUserWithCredentialsResponse } from '../auth/types';
import { DatabaseService } from '../database/services/database.service';
import { DB } from '../database/types/database.type';

import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponse, toUserWithCredentialsReponse } from './mapper/users.mapper';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly databaseService: DatabaseService) {}

    private get db(): Kysely<DB> {
        return this.databaseService.db;
    }

    async create(createUserDto: CreateUserDto): Promise<GetUserResponse> {
        const { email, passwordHash, firstName, lastName, avatarUrl } = createUserDto;

        try {
            const user = await this.db
                .insertInto('person')
                .values({
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    password_hash: passwordHash,
                    avatar_url: avatarUrl,
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            return toUserResponse(user);
        } catch (error) {
            handleDatabaseError(error, this.logger, 'UsersService.create');
        }
    }

    async findByEmail(email: string): Promise<GetUserResponse | null> {
        const user = await this.db
            .selectFrom('person')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return toUserResponse(user);
    }

    async findCredentialsByEmail(email: string): Promise<GetUserWithCredentialsResponse | null> {
        const user = await this.db
            .selectFrom('person')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return toUserWithCredentialsReponse(user);
    }

    async findOne(id: string): Promise<GetUserResponse | null> {
        const user = await this.db
            .selectFrom('person')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return toUserResponse(user);
    }

    async incrementFailedLoginAttempts(personId: string): Promise<void> {
        try {
            await this.db
                .updateTable('person')
                .set({
                    failed_login_attempts: sql`failed_login_attempts + 1`,
                    locked_until: sql`CASE WHEN failed_login_attempts + 1 >= ${MAX_LOGIN_ATTEMPTS} THEN ${addDays(new Date(), 1).toISOString()}::timestamptz ELSE locked_until END`,
                    updated_at: new Date(),
                })
                .where('id', '=', personId)
                .executeTakeFirst();
        } catch (error) {
            handleDatabaseError(error, this.logger, 'UsersService.incrementFailedLoginAttempts');
        }
    }

    async resetFailedLoginAttempts(personId: string): Promise<void> {
        try {
            await this.db
                .updateTable('person')
                .set({
                    failed_login_attempts: 0,
                    locked_until: null,
                    updated_at: new Date(),
                })
                .where('id', '=', personId)
                .executeTakeFirst();
        } catch (error) {
            handleDatabaseError(error, this.logger, 'UsersService.resetFailedLoginAttempts');
        }
    }

    async updateLastSignedIn(personId: string): Promise<void> {
        try {
            await this.db
                .updateTable('person')
                .set({ last_login_at: new Date(), updated_at: new Date() })
                .where('id', '=', personId)
                .executeTakeFirst();
        } catch (error) {
            handleDatabaseError(error, this.logger, 'UsersService.updateLastSignedIn');
        }
    }
}
