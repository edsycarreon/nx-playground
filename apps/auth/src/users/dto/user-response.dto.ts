import {
    isBoolean,
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class UserResponseDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsOptional()
    @IsBoolean()
    emailVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    is2faEnabled?: boolean;

    @IsOptional()
    @IsString()
    twoFASecret?: string;

    @IsOptional()
    @IsNumber()
    failedLoginAttempts?: number;

    @IsOptional()
    @IsDate()
    lastLoginAt?: Date;

    @IsOptional()
    @IsDate()
    lockedUntil?: Date;

    @IsOptional()
    @IsDate()
    createdAt?: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;

    @IsOptional()
    @IsDate()
    deletedAt?: Date;
}
