import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConcertInfrastructureModule } from './infrastructure/concert-infrastructure.module';
import { ConcertController } from './presentation/http/concert.controller';
import { CreateConcertHandler } from './application/commands/handlers/create-concert.handler';
import { UpdateConcertHandler } from './application/commands/handlers/update-concert.handler';
import { GenerateTicketsHandler } from './application/commands/handlers/generate-tickets.handler';
import { CreateArtistHandler, UpdateArtistHandler, DeleteArtistHandler } from './application/commands/handlers/artist.handler';
import { AddPerformanceHandler, UpdatePerformanceScheduleHandler, RemovePerformanceHandler } from './application/commands/handlers/performance.handler';
import { GetAllConcertsHandler } from './application/queries/handlers/get-all-concerts.handler';
import { GetConcertByIdHandler } from './application/queries/handlers/get-concert-by-id.handler';
import { GetTicketsByConcertHandler } from './application/queries/handlers/get-tickets-by-concert.handler';
import { SearchConcertHandler } from './application/queries/handlers/search-concert.handler';
import { DeleteTicketTypeHandler } from './application/commands/handlers/delete-ticket-type.handler';
import { UpdateTicketPriceHandler } from './application/commands/handlers/update-ticket-price.handler';
import { SyncElasticsearchHandler } from './application/commands/handlers/sync-elasticsearch.handler';
import { ConcertSearchHandler } from './application/events/handlers/concert-search.handler';

export const QueryHandlers = [
    GetAllConcertsHandler,
    GetConcertByIdHandler,
    GetTicketsByConcertHandler,
    SearchConcertHandler
];

export const CommandHandlers = [
    CreateConcertHandler,
    UpdateConcertHandler,
    GenerateTicketsHandler,
    CreateArtistHandler,
    UpdateArtistHandler,
    DeleteArtistHandler,
    AddPerformanceHandler,
    UpdatePerformanceScheduleHandler,
    RemovePerformanceHandler,
    DeleteTicketTypeHandler,
    UpdateTicketPriceHandler,
    SyncElasticsearchHandler
];

export const EventHandlers = [
    ConcertSearchHandler
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
        ...QueryHandlers,
        ...EventHandlers
    ]
})
export class ConcertModule { }
