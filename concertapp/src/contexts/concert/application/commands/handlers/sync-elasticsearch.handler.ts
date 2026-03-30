import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SyncElasticsearchCommand } from '../sync-elasticsearch.command';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { ConcertSearchService } from '../../../infrastructure/elasticsearch/elasticsearch.service';

@CommandHandler(SyncElasticsearchCommand)
export class SyncElasticsearchHandler implements ICommandHandler<SyncElasticsearchCommand, number> {
    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepository: IConcertRepository,
        private readonly esService: ConcertSearchService,
    ) { }

    async execute(command: SyncElasticsearchCommand): Promise<number> {
        console.log('[ES-Sync] Starting full re-index...');

        // 1. Fetch all concerts from database
        const concerts = await this.concertRepository.findAll();

        console.log(`[ES-Sync] Syncing ${concerts.length} concerts to Elasticsearch.`);

        // 2. Index mỗi concert với đầy đủ thông tin mở rộng
        let count = 0;
        for (const concert of concerts) {
            await this.esService.indexConcert(concert);
            count++;
        }

        console.log(`[ES-Sync] Successfully indexed ${count} concerts.`);
        return count;
    }
}
