import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';

import { DatabaseService } from '../database/services/database.service';

import { RefreshTokenService } from './refresh-token.service';

const mockExecute = jest.fn();
const mockValues = jest.fn(() => ({ execute: mockExecute }));
const mockInsertInto = jest.fn(() => ({ values: mockValues }));

const mockDb = {
    insertInto: mockInsertInto,
};

const mockRequest = {
    ip: '127.0.0.1',
    headers: {
        'user-agent': 'test-agent',
        'x-device-name': 'test-device',
        'x-device-type': 'desktop',
    },
} as unknown as Request;

describe('RefreshTokenService', () => {
    let service: RefreshTokenService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefreshTokenService,
                {
                    provide: DatabaseService,
                    useValue: { db: mockDb },
                },
            ],
        }).compile();

        service = module.get<RefreshTokenService>(RefreshTokenService);
    });

    describe('create', () => {
        const payload = {
            personId: '550e8400-e29b-41d4-a716-446655440000',
            tokenHash: 'hashed_token_value',
            expiresAt: new Date('2024-12-31'),
        };

        it('should insert refresh token into database', async () => {
            mockExecute.mockResolvedValue(undefined);

            await service.create(payload, mockRequest);

            expect(mockInsertInto).toHaveBeenCalledWith('refresh_token');
            expect(mockValues).toHaveBeenCalledWith(
                expect.objectContaining({
                    person_id: payload.personId,
                    token_hash: payload.tokenHash,
                    expires_at: payload.expiresAt,
                    ip_address: '127.0.0.1',
                    user_agent: 'test-agent',
                }),
            );
        });

        it('should throw ConflictException on unique constraint violation', async () => {
            mockExecute.mockRejectedValue({
                code: '23505',
                constraint: 'refresh_token_token_hash_key',
            });

            await expect(service.create(payload, mockRequest)).rejects.toThrow(ConflictException);
        });

        it('should throw InternalServerErrorException on unexpected database error', async () => {
            mockExecute.mockRejectedValue(new Error('connection refused'));

            await expect(service.create(payload, mockRequest)).rejects.toThrow(
                InternalServerErrorException,
            );
        });

        it('should use x-forwarded-for header when ip is not available', async () => {
            mockExecute.mockResolvedValue(undefined);

            const reqWithoutIp = {
                ip: undefined,
                headers: {
                    'x-forwarded-for': '192.168.1.1',
                    'user-agent': 'test-agent',
                },
            } as unknown as Request;

            await service.create(payload, reqWithoutIp);

            expect(mockValues).toHaveBeenCalledWith(
                expect.objectContaining({
                    ip_address: '192.168.1.1',
                }),
            );
        });
    });
});
