import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchConcertQuery } from '../search-concert.query';
import { ConcertSearchService } from '../../../infrastructure/elasticsearch/elasticsearch.service';

@QueryHandler(SearchConcertQuery)
export class SearchConcertHandler implements IQueryHandler<SearchConcertQuery> {
    constructor(
        private readonly esService: ConcertSearchService,
    ) { }

    async execute(query: SearchConcertQuery) {
        const { query: searchTerm } = query;
        if (!searchTerm) {
            console.log('[Search] Empty query, returning nothing');
            return [];
        }

        console.log(`[Elasticsearch] Searching for: "${searchTerm}"...`);

        // Search in Elasticsearch with fuzzy & multi-field support
        const results = await this.esService.search(searchTerm);

        console.log(`[Elasticsearch] Found ${results.length} results.`);

        return results.map((c: any) => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate,
            location: c.location,
            imageUrl: c.imageUrl,
            artists: c.artists || [],
            organizerName: c.organizerName || '',
            minPrice: c.minPrice || 0,
            category: c.category || 'Music'
        }));
    }
}
