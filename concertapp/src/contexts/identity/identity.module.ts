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
import { ForgotPasswordHandler } from './application/commands/forgot-password.command';
import { ResetPasswordHandler } from './application/commands/reset-password.command';
import { ChangePasswordHandler } from './application/commands/change-password.command';
import { UpdateProfileHandler } from './application/commands/update-profile.command';

export const CommandHandlers = [
    LoginHandler,
    RegisterHandler,
    RefreshTokenHandler,
    GoogleAuthHandler,
    ForgotPasswordHandler,
    ResetPasswordHandler,
    ChangePasswordHandler,
    UpdateProfileHandler
];

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
