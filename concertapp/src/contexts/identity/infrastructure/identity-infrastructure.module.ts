import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../prisma.service';
import { IUSER_REPOSITORY } from '../domain/repository/user.repository.interface';
import { PrismaUserRepository } from './persistence/prisma/prisma-user.repository';

import { ITOKEN_SERVICE } from '../domain/service/token.service.interface';
import { JwtTokenService } from './auth/jwt-token.service';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'defaultSecret12345',
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        PrismaService,
        {
            provide: IUSER_REPOSITORY,
            useClass: PrismaUserRepository,
        },
        {
            provide: ITOKEN_SERVICE,
            useClass: JwtTokenService,
        }
    ],
    exports: [IUSER_REPOSITORY, ITOKEN_SERVICE, JwtModule],
})
export class IdentityInfrastructureModule { }
