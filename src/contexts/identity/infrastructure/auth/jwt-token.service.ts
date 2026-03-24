import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenService, AuthTokens } from '../../domain/service/token.service.interface';
import { User } from '../../domain/entity/user.entity';

@Injectable()
export class JwtTokenService implements ITokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    generateTokens(user: User): AuthTokens {
        const payload = {
            sub: user.getId(),
            email: user.getEmail().value,
            role: user.getRole().getValue()
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'defaultRefreshSecret12345';
        const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

        // Custom signing for refresh token as it uses a different secret/ttl
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshTokenSecret,
            expiresIn: refreshTokenExpiresIn as any
        });

        return {
            accessToken,
            refreshToken
        };
    }

    verifyToken(token: string, isRefresh: boolean = false): any {
        try {
            if (isRefresh) {
                const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'defaultRefreshSecret12345';
                return this.jwtService.verify(token, { secret: refreshTokenSecret });
            }
            return this.jwtService.verify(token);
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
