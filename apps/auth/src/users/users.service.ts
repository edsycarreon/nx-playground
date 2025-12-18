import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto';
import { DatabaseService } from '@edsy-services/database';
import { toUserResponseDto } from './mapper/users.mapper';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) {}

    private get db() {
        return this.databaseService.db;
    }

    async create(createUserDto: CreateUserDto) {
        const { email, passwordHash, firstName, lastName, avatarUrl } = createUserDto;
        const user = await this.db
            .insertInto('person')
            .values({
                email,
                first_name: firstName,
                last_name: lastName,
                password_hash: passwordHash,
                avatar_url: avatarUrl,
            })
            .returning(['id', 'email', 'first_name', 'last_name'])
            .executeTakeFirst();

        return user;
    }

    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.db
            .selectFrom('person')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return toUserResponseDto(user);
    }

    async findOne(id: string): Promise<UserResponseDto> | null {
        const user = await this.db
            .selectFrom('person')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return toUserResponseDto(user);
    }
}
