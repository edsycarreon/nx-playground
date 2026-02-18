import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';

import { DeviceInfoDto } from '../../auth/dto/device-info.dto';

export class CreateRefreshTokenDto {
    @IsString()
    personId: string;

    @IsString()
    tokenHash: string;

    @IsDate()
    expiresAt: Date;

    @IsOptional()
    @ValidateNested()
    @Type(() => DeviceInfoDto)
    deviceType?: DeviceInfoDto;
}
