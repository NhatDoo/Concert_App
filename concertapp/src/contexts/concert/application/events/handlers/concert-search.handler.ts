import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConcertCreatedEvent } from '../../../domain/events/concert-created.event';
import { ConcertSearchService } from '../../../infrastructure/elasticsearch/elasticsearch.service';

@EventsHandler(ConcertCreatedEvent)
export class ConcertSearchHandler implements IEventHandler<ConcertCreatedEvent> {
    constructor(private readonly esService: ConcertSearchService) { }

    async handle(event: ConcertCreatedEvent) {
        console.log(`[ES-Sync] Indexing concert: ${event.name}`);
        await this.esService.indexConcert({
            id: event.concertId,
            name: event.name,
            location: event.location,
            startDate: event.startDate
        });
    }
}
