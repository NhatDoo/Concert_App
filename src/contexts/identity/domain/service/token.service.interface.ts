import { User } from '../entity/user.entity';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface ITokenService {
    generateTokens(user: User): AuthTokens;
    verifyToken(token: string, isRefresh?: boolean): any;
}

export const ITOKEN_SERVICE = Symbol('ITokenService');
