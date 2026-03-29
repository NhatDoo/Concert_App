import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConcertInfrastructureModule } from './infrastructure/concert-infrastructure.module';
import { ConcertController } from './presentation/http/concert.controller';
import { CreateConcertHandler } from './application/commands/handlers/create-concert.handler';
import { GenerateTicketsHandler } from './application/commands/handlers/generate-tickets.handler';
import { CreateArtistHandler, UpdateArtistHandler } from './application/commands/handlers/artist.handler';
import { AddPerformanceHandler, UpdatePerformanceScheduleHandler } from './application/commands/handlers/performance.handler';
import { GetAllConcertsHandler } from './application/queries/handlers/get-all-concerts.handler';
import { GetConcertByIdHandler } from './application/queries/handlers/get-concert-by-id.handler';
import { GetTicketsByConcertHandler } from './application/queries/handlers/get-tickets-by-concert.handler';
import { DeleteTicketTypeHandler } from './application/commands/handlers/delete-ticket-type.handler';
import { UpdateTicketPriceHandler } from './application/commands/handlers/update-ticket-price.handler';

export const QueryHandlers = [
    GetAllConcertsHandler,
    GetConcertByIdHandler,
    GetTicketsByConcertHandler
];

export const CommandHandlers = [
    CreateConcertHandler,
    GenerateTicketsHandler,
    CreateArtistHandler,
    UpdateArtistHandler,
    AddPerformanceHandler,
    UpdatePerformanceScheduleHandler,
    DeleteTicketTypeHandler,
    UpdateTicketPriceHandler
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
        ...CommandHandlers,
        ...QueryHandlers
    ]
})
export class ConcertModule { }
