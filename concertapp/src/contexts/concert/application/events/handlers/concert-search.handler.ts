import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConcertCreatedEvent } from '../../../domain/events/concert-created.event';
import { ConcertRescheduledEvent } from '../../../domain/events/concert-rescheduled.event';
import { PerformanceAddedEvent } from '../../../domain/events/performance-added.event';
import { TicketPriceUpdatedEvent } from '../../../domain/events/ticket-price-updated.event';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ES_SYNC_QUEUE, ES_SYNC_JOB } from '../../../infrastructure/elasticsearch/elasticsearch.constants';

@EventsHandler(
    ConcertCreatedEvent,
    ConcertRescheduledEvent,
    PerformanceAddedEvent,
    TicketPriceUpdatedEvent
)
export class ConcertSearchHandler implements IEventHandler<
    ConcertCreatedEvent |
    ConcertRescheduledEvent |
    PerformanceAddedEvent |
    TicketPriceUpdatedEvent
> {
    constructor(
        @InjectQueue(ES_SYNC_QUEUE) private readonly syncQueue: Queue
    ) { }

    async handle(event: any) {
        const concertId = event.concertId;
        console.log(`[Queue-Producer] Notifying sync queue for concert: ${concertId}`);

        await this.syncQueue.add(ES_SYNC_JOB, {
            concertId: concertId,
        }, {
            attempts: 3, // Retry 3 times if fail
            backoff: {
                type: 'exponential',
                delay: 1000,
            }
        });
    }
}
