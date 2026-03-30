import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ConcertSearchService implements OnModuleInit {
    private readonly INDEX_NAME = 'concerts';

    constructor(
        @Inject(NestElasticsearchService)
        private readonly esService: NestElasticsearchService
    ) { }

    async onModuleInit() {
        await this.createIndexIfNotExists();
    }

    private async createIndexIfNotExists() {
        try {
            const exists = await this.esService.indices.exists({ index: this.INDEX_NAME });
            if (!exists) {
                await this.esService.indices.create({
                    index: this.INDEX_NAME,
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { type: 'text', analyzer: 'standard' },
                            location: { type: 'text' },
                            startDate: { type: 'date' },
                            imageUrl: { type: 'keyword' },
                            artists: { type: 'text', analyzer: 'standard' },
                            organizerName: { type: 'text', analyzer: 'standard' },
                            minPrice: { type: 'double' },
                            category: { type: 'keyword' }
                        }
                    }
                });
                console.log(`[Elasticsearch] Index "${this.INDEX_NAME}" created.`);
            }
        } catch (error: any) {
            console.warn('[Elasticsearch] Could not connect or create index:', error.message);
        }
    }

    async indexConcert(concert: any) {
        try {
            await this.esService.index({
                index: this.INDEX_NAME,
                id: concert.id,
                document: {
                    id: concert.id,
                    name: concert.name,
                    location: concert.location,
                    startDate: concert.startDate,
                    imageUrl: concert.imageUrl,
                    artists: concert.artists || [],
                    organizerName: concert.organizerName || '',
                    minPrice: concert.minPrice || 0,
                    category: concert.category || 'Music'
                }
            });
        } catch (error: any) {
            console.error('[Elasticsearch] Indexing failed:', error.message);
        }
    }

    async search(query: string) {
        try {
            const response = await this.esService.search({
                index: this.INDEX_NAME,
                size: 20, // Return more results
                query: {
                    multi_match: {
                        query: query,
                        fields: ['name', 'location', 'artists', 'organizerName'],
                        fuzziness: 'AUTO'
                    }
                }
            });
            return response.hits.hits.map((hit: any) => hit._source);
        } catch (error: any) {
            console.warn('[Elasticsearch] Search failed, falling back to empty:', error.message);
            return [];
        }
    }
}
