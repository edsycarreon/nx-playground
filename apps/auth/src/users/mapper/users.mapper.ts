import { Person } from '@edsy-services/database';
import { UserResponseDto } from '../dto';
import { Selectable } from 'kysely';

export function toUserResponseDto(person: Partial<Selectable<Person>>): UserResponseDto {
    return {
        id: person.id,
        email: person.email,
        firstName: person.first_name,
        lastName: person.last_name,
        avatarUrl: person.avatar_url,
        emailVerified: person.email_verified,
        isActive: person.is_active,
        is2faEnabled: person.is_2fa_enabled,
        lastLoginAt: person.last_login_at,
        createdAt: person.created_at,
        failedLoginAttempts: person.failed_login_attempts,
    };
}
