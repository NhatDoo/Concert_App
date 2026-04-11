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
            title: c.name,
            location: c.location,
            dateStr: new Date(c.startDate).toLocaleDateString('vi-VN'),
            imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a',
            organizer: c.organizerName || 'Ban tổ chức',
            priceStr: c.minPrice > 0 ? `${c.minPrice.toLocaleString('vi-VN')} VND` : 'Liên hệ',
            category: c.category || 'Nhạc Sống'
        }));
    }
}
