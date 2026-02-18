import type { GetUserResponse } from '@edsy-services/common';

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
