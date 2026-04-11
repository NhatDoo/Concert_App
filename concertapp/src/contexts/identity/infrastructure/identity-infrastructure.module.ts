import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../prisma.service';
import { IUSER_REPOSITORY } from '../domain/repository/user.repository.interface';
import { PrismaUserRepository } from './persistence/prisma/prisma-user.repository';

import { ITOKEN_SERVICE } from '../domain/service/token.service.interface';
import { JwtTokenService } from './auth/jwt-token.service';
import { MailService } from './mail/mail.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN')) as any
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
        },
        MailService,
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [IUSER_REPOSITORY, ITOKEN_SERVICE, JwtModule, PassportModule, PrismaService, MailService, JwtAuthGuard],
})
export class IdentityInfrastructureModule { }
