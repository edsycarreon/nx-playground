import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
    hashSaltRounds: Number(process.env.SALT_ROUNDS),
}));
