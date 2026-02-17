import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

export class UserResponseDto {
    @IsString()
    id: string;

    @IsString()
    email: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    avatarUrl: string;

    @IsBoolean()
    emailVerified: boolean;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    is2faEnabled: boolean;

    @IsString()
    twoFASecret: string;

    @IsNumber()
    failedLoginAttempts: number;

    @IsDate()
    lastLoginAt: Date;

    @IsDate()
    lockedUntil: Date;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsDate()
    deletedAt: Date;
}
