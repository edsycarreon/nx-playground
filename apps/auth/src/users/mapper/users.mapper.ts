import type { Selectable } from 'kysely';

import type { GetUserResponse } from '../../auth/types';
import type { Person } from '../../database/types/database.type';

export function toUserResponseDto(person: Selectable<Person>): GetUserResponse {
    return {
        id: person.id,
        email: person.email,
        firstName: person.first_name,
        lastName: person.last_name,
        avatarUrl: person.avatar_url,
        isEmailVerified: person.email_verified,
        isActive: person.is_active,
        lastLoginAt: person.last_login_at,
        createdAt: person.created_at,
        updatedAt: person.updated_at,
    };
}
