import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const sha256 = (data: string): string => {
    return createHash('sha256').update(data).digest('hex');
};

export const generateSecureToken = (bytes = 32): string => {
    return randomBytes(bytes).toString('hex');
};

export const secureCompare = (a: string, b: string): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return timingSafeEqual(bufA, bufB);
};
