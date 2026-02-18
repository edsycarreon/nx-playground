/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { ArgumentsHost } from '@nestjs/common';
import {
    BadRequestException,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
        filter = new AllExceptionsFilter();
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });

        mockHost = {
            switchToHttp: () => ({
                getResponse: () => ({ status: mockStatus }),
                getRequest: () => ({}),
            }),
            getArgs: () => [],
            getArgByIndex: () => ({}),
            switchToRpc: () => ({}) as never,
            switchToWs: () => ({}) as never,
            getType: () => 'http',
        } as unknown as ArgumentsHost;

        jest.spyOn(filter['logger'], 'warn').mockImplementation();
        jest.spyOn(filter['logger'], 'error').mockImplementation();
    });

    describe('HttpException handling', () => {
        it('should return correct status and body for NotFoundException', () => {
            const exception = new NotFoundException('User not found');

            filter.catch(exception, mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'User not found',
                error: 'Not Found',
            });
        });

        it('should return correct status and body for BadRequestException with validation errors', () => {
            const exception = new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ['email must be a valid email', 'password must be at least 8 characters'],
                error: 'Bad Request',
            });

            filter.catch(exception, mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ['email must be a valid email', 'password must be at least 8 characters'],
                error: 'Bad Request',
            });
        });

        it('should handle HttpException with string response', () => {
            const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

            filter.catch(exception, mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.FORBIDDEN,
                message: 'Forbidden',
            });
        });

        it('should log warn for 4xx errors', () => {
            const exception = new NotFoundException('User not found');

            filter.catch(exception, mockHost);

            expect(filter['logger'].warn).toHaveBeenCalledWith(expect.stringContaining('404'));
            expect(filter['logger'].error).not.toHaveBeenCalled();
        });

        it('should log error for 5xx errors', () => {
            const exception = new InternalServerErrorException('Database error');

            filter.catch(exception, mockHost);

            expect(filter['logger'].error).toHaveBeenCalledWith(
                expect.stringContaining('500'),
                expect.any(String),
            );
        });
    });

    describe('non-HttpException handling', () => {
        it('should return 500 for a plain Error', () => {
            const exception = new Error('Something unexpected happened');

            filter.catch(exception, mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            });
        });

        it('should return 500 for a string thrown value', () => {
            filter.catch('unexpected string error', mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            });
        });

        it('should return 500 for null thrown value', () => {
            filter.catch(null, mockHost);

            expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            });
        });

        it('should log error with stack trace for Error instances', () => {
            const exception = new Error('Something unexpected happened');

            filter.catch(exception, mockHost);

            expect(filter['logger'].error).toHaveBeenCalledWith(
                'Unhandled exception',
                expect.stringContaining('Something unexpected happened'),
            );
        });

        it('should log error with stringified value for non-Error values', () => {
            filter.catch('raw string', mockHost);

            expect(filter['logger'].error).toHaveBeenCalledWith(
                'Unhandled exception',
                'raw string',
            );
        });
    });
});
