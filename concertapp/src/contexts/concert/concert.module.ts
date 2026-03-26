import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConcertInfrastructureModule } from './infrastructure/concert-infrastructure.module';
import { ConcertController } from './presentation/http/concert.controller';
import { CreateConcertHandler } from './application/commands/handlers/create-concert.handler';
import { GenerateTicketsHandler } from './application/commands/handlers/generate-tickets.handler';
import { CreateArtistHandler, UpdateArtistHandler } from './application/commands/handlers/artist.handler';
import { AddPerformanceHandler, UpdatePerformanceScheduleHandler } from './application/commands/handlers/performance.handler';

export const CommandHandlers = [
    CreateConcertHandler,
    GenerateTicketsHandler,
    CreateArtistHandler,
    UpdateArtistHandler,
    AddPerformanceHandler,
    UpdatePerformanceScheduleHandler
];

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
