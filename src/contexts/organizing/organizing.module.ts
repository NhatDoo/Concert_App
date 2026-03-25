import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizingInfrastructureModule } from './infrastructure/organizing-infrastructure.module';
import { OrganizingController } from './presentation/http/organizing.controller';
import { AssignLocationHandler } from './application/commands/handlers/assign-location.handler';

export const CommandHandlers = [AssignLocationHandler];

@Module({
    imports: [
        CqrsModule,
        OrganizingInfrastructureModule
    ],
    controllers: [
        OrganizingController
    ],
    providers: [
        ...CommandHandlers
    ]
})
export class OrganizingModule { }
