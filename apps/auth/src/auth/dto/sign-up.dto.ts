import { IsString, MinLength } from 'class-validator';

export class SignUpDto {
    @IsString()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}
