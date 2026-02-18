import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';

import { handleDatabaseError } from './database-error.handler';

describe('handleDatabaseError', () => {
    let logger: Logger;

    beforeEach(() => {
        logger = new Logger('TestContext');
        jest.spyOn(logger, 'warn').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
    });

    describe('PostgreSQL unique constraint violation (23505)', () => {
        it('should throw ConflictException', () => {
            const error = { code: '23505', constraint: 'person_email_key' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(ConflictException);
            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                'Resource already exists',
            );
        });

        it('should log a warning with constraint name', () => {
            const error = { code: '23505', constraint: 'person_email_key' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow();
            expect(logger.warn).toHaveBeenCalledWith(
                '[Test] Unique constraint violation: person_email_key',
            );
        });
    });

    describe('PostgreSQL foreign key violation (23503)', () => {
        it('should throw ConflictException', () => {
            const error = { code: '23503', constraint: 'refresh_token_person_id_fkey' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(ConflictException);
            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                'Referenced resource not found',
            );
        });

        it('should log a warning with constraint name', () => {
            const error = { code: '23503', constraint: 'refresh_token_person_id_fkey' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow();
            expect(logger.warn).toHaveBeenCalledWith(
                '[Test] Foreign key violation: refresh_token_person_id_fkey',
            );
        });
    });

    describe('PostgreSQL not-null violation (23502)', () => {
        it('should throw InternalServerErrorException', () => {
            const error = { code: '23502', detail: 'Failing row contains (null, ...)' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                InternalServerErrorException,
            );
            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                'Missing required field',
            );
        });

        it('should log a warning with detail', () => {
            const error = { code: '23502', detail: 'Failing row contains (null, ...)' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow();
            expect(logger.warn).toHaveBeenCalledWith(
                '[Test] Not-null violation: Failing row contains (null, ...)',
            );
        });
    });

    describe('unknown PostgreSQL error code', () => {
        it('should throw InternalServerErrorException', () => {
            const error = { code: '42601', message: 'syntax error' };

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                InternalServerErrorException,
            );
            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                'An unexpected error occurred',
            );
        });

        it('should log at error level', () => {
            const error = Object.assign(new Error('syntax error'), { code: '42601' });

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow();
            expect(logger.error).toHaveBeenCalledWith(
                '[Test] Unexpected database error',
                expect.any(String),
            );
        });
    });

    describe('non-PostgreSQL error', () => {
        it('should throw InternalServerErrorException for a plain Error', () => {
            const error = new Error('connection refused');

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                InternalServerErrorException,
            );
            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow(
                'An unexpected error occurred',
            );
        });

        it('should throw InternalServerErrorException for a string', () => {
            expect(() => handleDatabaseError('something broke', logger, 'Test')).toThrow(
                InternalServerErrorException,
            );
        });

        it('should log at error level with stack trace when available', () => {
            const error = new Error('connection refused');

            expect(() => handleDatabaseError(error, logger, 'Test')).toThrow();
            expect(logger.error).toHaveBeenCalledWith(
                '[Test] Unexpected database error',
                expect.stringContaining('connection refused'),
            );
        });

        it('should log stringified value when no stack trace available', () => {
            expect(() => handleDatabaseError('raw string error', logger)).toThrow();
            expect(logger.error).toHaveBeenCalledWith(
                ' Unexpected database error',
                'raw string error',
            );
        });
    });

    describe('context parameter', () => {
        it('should prefix log messages when context is provided', () => {
            const error = { code: '23505', constraint: 'test_key' };

            expect(() => handleDatabaseError(error, logger, 'UsersService.create')).toThrow();
            expect(logger.warn).toHaveBeenCalledWith(
                '[UsersService.create] Unique constraint violation: test_key',
            );
        });

        it('should omit prefix when context is not provided', () => {
            const error = { code: '23505', constraint: 'test_key' };

            expect(() => handleDatabaseError(error, logger)).toThrow();
            expect(logger.warn).toHaveBeenCalledWith(' Unique constraint violation: test_key');
        });
    });
});
