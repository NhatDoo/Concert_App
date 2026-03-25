import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConcertInfrastructureModule } from './infrastructure/concert-infrastructure.module';
import { ConcertController } from './presentation/http/concert.controller';
import { CreateConcertHandler } from './application/commands/handlers/create-concert.handler';

export const CommandHandlers = [CreateConcertHandler];

@Module({
    imports: [
        CqrsModule,
        ConcertInfrastructureModule
    ],
    controllers: [
        ConcertController
    ],
    providers: [
        ...CommandHandlers
    ]
})
export class ConcertModule { }
