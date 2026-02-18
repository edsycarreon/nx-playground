import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DeviceInfoDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    deviceName?: string;

    @IsOptional()
    @IsIn(['mobile', 'tablet', 'desktop', 'unknown'])
    deviceType?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    deviceId?: string;
}
