import { registerAs } from '@nestjs/config';

export const commonConfig = registerAs('common', () => ({
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
}));
