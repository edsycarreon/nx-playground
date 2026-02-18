import type { Logger } from '@nestjs/common';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';

interface PostgresError {
    code?: string;
    constraint?: string;
    detail?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export function handleDatabaseError(error: unknown, logger: Logger, context?: string): never {
    const prefix = context ? `[${context}]` : '';

    if (isPostgresError(error)) {
        switch (error.code) {
            case PG_UNIQUE_VIOLATION:
                logger.warn(`${prefix} Unique constraint violation: ${error.constraint}`);
                throw new ConflictException('Resource already exists');

            case PG_FOREIGN_KEY_VIOLATION:
                logger.warn(`${prefix} Foreign key violation: ${error.constraint}`);
                throw new ConflictException('Referenced resource not found');

            case PG_NOT_NULL_VIOLATION:
                logger.warn(`${prefix} Not-null violation: ${error.detail}`);
                throw new InternalServerErrorException('Missing required field');
        }
    }

    logger.error(
        `${prefix} Unexpected database error`,
        error instanceof Error ? error.stack : String(error),
    );
    throw new InternalServerErrorException('An unexpected error occurred');
}
