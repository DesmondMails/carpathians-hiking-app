import { PublicUser } from './user';
export interface LoginResponse {
    user: PublicUser;
    accessToken: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
}
