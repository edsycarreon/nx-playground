import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
    @IsString()
    id: string;

    @IsString()
    email: string;

    @IsString()
    @IsOptional()
    firstName: string | null;

    @IsString()
    @IsOptional()
    lastName: string | null;

    @IsString()
    @IsOptional()
    avatarUrl: string | null;

    @IsBoolean()
    isEmailVerified: boolean;

    @IsBoolean()
    isActive: boolean;

    @IsDate()
    @IsOptional()
    lastLoginAt: Date | null;

    @IsDate()
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt: Date | null;
}
