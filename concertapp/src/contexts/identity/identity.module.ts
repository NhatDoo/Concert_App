import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { IdentityInfrastructureModule } from './infrastructure/identity-infrastructure.module';
import { IdentityController } from './presentation/http/identity.controller';
import { LoginHandler } from './application/commands/handlers/login.handler';
import { RegisterHandler } from './application/commands/handlers/register.handler';
import { RefreshTokenHandler } from './application/commands/handlers/refresh-token.handler';
import { GoogleAuthHandler } from './application/commands/handlers/google-auth.handler';
import { GoogleStrategy } from './infrastructure/auth/google.strategy';

export const CommandHandlers = [LoginHandler, RegisterHandler, RefreshTokenHandler, GoogleAuthHandler];

@Module({
    imports: [
        CqrsModule,
        IdentityInfrastructureModule,
        PassportModule,
        ConfigModule
    ],
    controllers: [
        IdentityController
    ],
    providers: [
        ...CommandHandlers,
        GoogleStrategy
    ]
})
export class IdentityModule { }
