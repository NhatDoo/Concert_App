import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Inject, Logger } from '@nestjs/common';
import { ES_SYNC_QUEUE, ES_SYNC_JOB } from './elasticsearch.constants';
import { ICONCERT_REPOSITORY } from '../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../domain/repository/concert.repository.interface';
import { ConcertSearchService } from './elasticsearch.service';

@Processor(ES_SYNC_QUEUE)
export class ElasticsearchProcessor {
    private readonly logger = new Logger(ElasticsearchProcessor.name);

    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepository: IConcertRepository,
        private readonly esService: ConcertSearchService,
    ) { }

    @Process(ES_SYNC_JOB)
    async handleSync(job: Job<any>): Promise<any> {
        const { concertId } = job.data;
        this.logger.log(`[Queue-Worker] Syncing concert: ${concertId}`);

        try {
            // Fetch full concert data
            const concerts = await this.concertRepository.findAll();
            const concert = concerts.find(c => c.id === concertId);

            if (!concert) {
                this.logger.warn(`[Queue-Worker] Concert ${concertId} not found in DB, skipping sync.`);
                return;
            }

            // Push to Elasticsearch
            await this.esService.indexConcert(concert);
            this.logger.log(`[Queue-Worker] Successfully synced concert: ${concert.name}`);
        } catch (error) {
            this.logger.error(`[Queue-Worker] Sync failed for ${concertId}: ${error.message}`);
            throw error;
        }
    }
}
