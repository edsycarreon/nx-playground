import type { GetUserResponse } from '@edsy-services/common';
import type { Selectable } from 'kysely';

import type { GetUserWithCredentialsResponse } from '../../auth/types';
import type { Person } from '../../database/types/database.type';

export function toUserResponse(person: Selectable<Person>): GetUserResponse {
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

export function toUserWithCredentialsReponse(
    person: Selectable<Person>,
): GetUserWithCredentialsResponse {
    return {
        id: person.id,
        email: person.email,
        passwordHash: person.password_hash,
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
