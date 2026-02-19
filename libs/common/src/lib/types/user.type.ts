export type GetUserResponse = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    isActive: boolean;
    failedLoginAttempts: number;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
};
