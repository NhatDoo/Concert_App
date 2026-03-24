import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityInfrastructureModule } from './infrastructure/identity-infrastructure.module';
import { IdentityController } from './presentation/http/identity.controller';
import { LoginHandler } from './application/commands/handlers/login.handler';
import { RegisterHandler } from './application/commands/handlers/register.handler';

export const CommandHandlers = [LoginHandler, RegisterHandler];

@Module({
    imports: [
        CqrsModule,
        IdentityInfrastructureModule
    ],
    controllers: [
        IdentityController
    ],
    providers: [
        ...CommandHandlers
    ]
})
export class IdentityModule { }
