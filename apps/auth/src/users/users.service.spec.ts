import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { DatabaseService } from '../database/services/database.service';

import { UsersService } from './users.service';

const mockPersonRow = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: null,
    email_verified: false,
    is_active: true,
    last_login_at: null,
    created_at: new Date('2024-01-01'),
    updated_at: null,
};

const mockExecuteTakeFirstOrThrow = jest.fn();
const mockExecuteTakeFirst = jest.fn();
const mockReturningAll = jest.fn(() => ({ executeTakeFirstOrThrow: mockExecuteTakeFirstOrThrow }));
const mockValues = jest.fn(() => ({ returningAll: mockReturningAll }));
const mockInsertInto = jest.fn(() => ({ values: mockValues }));
const mockWhere = jest.fn(() => ({ executeTakeFirst: mockExecuteTakeFirst }));
const mockSelectAll = jest.fn(() => ({ where: mockWhere }));
const mockSelectFrom = jest.fn(() => ({ selectAll: mockSelectAll }));

const mockDb = {
    insertInto: mockInsertInto,
    selectFrom: mockSelectFrom,
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: DatabaseService,
                    useValue: { db: mockDb },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    describe('create', () => {
        it('should create a user and return mapped response', async () => {
            mockExecuteTakeFirstOrThrow.mockResolvedValue(mockPersonRow);

            const result = await service.create({
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(result).toEqual({
                id: mockPersonRow.id,
                email: mockPersonRow.email,
                firstName: mockPersonRow.first_name,
                lastName: mockPersonRow.last_name,
                avatarUrl: mockPersonRow.avatar_url,
                isEmailVerified: mockPersonRow.email_verified,
                isActive: mockPersonRow.is_active,
                lastLoginAt: mockPersonRow.last_login_at,
                createdAt: mockPersonRow.created_at,
                updatedAt: mockPersonRow.updated_at,
            });
            expect(mockInsertInto).toHaveBeenCalledWith('person');
        });

        it('should throw ConflictException on unique constraint violation', async () => {
            mockExecuteTakeFirstOrThrow.mockRejectedValue({
                code: '23505',
                constraint: 'person_email_key',
            });

            await expect(
                service.create({
                    email: 'existing@example.com',
                    passwordHash: 'hashed',
                    firstName: 'John',
                    lastName: 'Doe',
                }),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw InternalServerErrorException on unexpected database error', async () => {
            mockExecuteTakeFirstOrThrow.mockRejectedValue(new Error('connection refused'));

            await expect(
                service.create({
                    email: 'test@example.com',
                    passwordHash: 'hashed',
                    firstName: 'John',
                    lastName: 'Doe',
                }),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findByEmail', () => {
        it('should return mapped user when found', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPersonRow);

            const result = await service.findByEmail('test@example.com');

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockPersonRow.id,
                    email: mockPersonRow.email,
                }),
            );
            expect(mockSelectFrom).toHaveBeenCalledWith('person');
            expect(mockWhere).toHaveBeenCalledWith('email', '=', 'test@example.com');
        });

        it('should return null when user not found', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            const result = await service.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('findCredentialsByEmail', () => {
        it('should return user with credentials when found', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPersonRow);

            const result = await service.findCredentialsByEmail('test@example.com');

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockPersonRow.id,
                    email: mockPersonRow.email,
                    passwordHash: mockPersonRow.password_hash,
                }),
            );
        });

        it('should return null when user not found', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            const result = await service.findCredentialsByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('findOne', () => {
        it('should return mapped user when found by id', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPersonRow);

            const result = await service.findOne(mockPersonRow.id);

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockPersonRow.id,
                    email: mockPersonRow.email,
                }),
            );
            expect(mockWhere).toHaveBeenCalledWith('id', '=', mockPersonRow.id);
        });

        it('should return null when user not found', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            const result = await service.findOne('nonexistent-id');

            expect(result).toBeNull();
        });
    });
});
