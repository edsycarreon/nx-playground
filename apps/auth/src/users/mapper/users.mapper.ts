import type { Person } from '@edsy-services/database';
import type { Selectable } from 'kysely';

import type { UserResponseDto } from '../dto';

export function toUserResponseDto(person: Partial<Selectable<Person>>): UserResponseDto {
    return {
        id: person.id ?? undefined,
        email: person.email ?? undefined,
        firstName: person.first_name ?? undefined,
        lastName: person.last_name ?? undefined,
        avatarUrl: person.avatar_url ?? undefined,
        emailVerified: person.email_verified ?? undefined,
        isActive: person.is_active ?? undefined,
        is2faEnabled: person.is_2fa_enabled ?? undefined,
        lastLoginAt: person.last_login_at ?? undefined,
        createdAt: person.created_at ?? undefined,
        failedLoginAttempts: person.failed_login_attempts ?? undefined,
    };
}
