import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Kysely } from 'kysely';

import { GetUserResponse, GetUserWithCredentialsResponse } from '../auth/types';
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
            this.logger.error('Failed to create user', error.stack);
            throw new InternalServerErrorException('Failed to create user');
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
}
