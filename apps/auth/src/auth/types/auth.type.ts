import type { GetUserResponse } from './user.type';

export type SignUpResponse = {
    user: GetUserResponse;
    accessToken: string;
    refreshToken: string;
};
