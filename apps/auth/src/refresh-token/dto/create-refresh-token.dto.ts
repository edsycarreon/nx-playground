import { IsDate, IsString } from 'class-validator';

export class CreateRefreshTokenDto {
    @IsString()
    personId: string;

    @IsString()
    tokenHash: string;

    @IsDate()
    expiresAt: Date;
}
