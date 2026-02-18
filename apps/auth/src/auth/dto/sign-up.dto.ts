import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

import { DeviceInfoDto } from './device-info.dto';

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

    @IsOptional()
    @ValidateNested()
    @Type(() => DeviceInfoDto)
    deviceType?: DeviceInfoDto;
}
