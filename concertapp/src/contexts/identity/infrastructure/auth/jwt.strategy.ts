import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    validate(payload: any) {
        if (!payload?.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            staffRole: payload.staffRole,
        };
    }
}
