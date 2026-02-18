import type { GetUserResponse } from './user.type';

export type SignUpResponse = {
    user: GetUserResponse;
    accessToken: string;
    refreshToken: string;
};

export type SignInResponse = {
    user: GetUserResponse;
    accessToken: string;
    refreshToken: string;
};
