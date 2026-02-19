export type GetUserWithCredentialsResponse = {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    isActive: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
};
