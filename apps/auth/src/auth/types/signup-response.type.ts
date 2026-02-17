import type { UserResponseDto } from '../../users/dto';

export type SignUpResponse = {
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
};
