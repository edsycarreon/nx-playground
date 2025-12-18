import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    email: string;

    @IsString()
    @MinLength(8)
    passwordHash: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}
