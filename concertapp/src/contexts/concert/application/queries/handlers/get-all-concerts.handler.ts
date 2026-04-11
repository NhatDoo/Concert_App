import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllConcertsQuery } from '../get-all-concerts.query';
import { PrismaService } from '../../../../../prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@QueryHandler(GetAllConcertsQuery)
export class GetAllConcertsHandler implements IQueryHandler<GetAllConcertsQuery> {
    private readonly CACHE_KEY = 'concerts:all:v2';
    private readonly CACHE_TTL = 300;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async execute(query: GetAllConcertsQuery): Promise<any[]> {

        const cachedConcerts = await this.redisService.get<any[]>(this.CACHE_KEY);
        if (cachedConcerts) {
            console.log('Returning concerts from Redis Cache!');
            return cachedConcerts;
        }


        console.log('Fetching concerts from Database...');
        const concerts = await this.prisma.concert.findMany({
            orderBy: {
                startDate: 'desc',
            },
            include: {
                organizer: true,
                categories: true,
                ticketPools: true
            }
        });


        const responseData = concerts.map(c => {
            const minPrice = c.ticketPools.length > 0 ? Math.min(...c.ticketPools.map(tp => tp.price)) : 0;
            return {
                id: c.id,
                title: c.name,
                name: c.name, // Added for consistency
                location: c.location,
                dateStr: new Date(c.startDate).toLocaleDateString('vi-VN'),
                startDate: c.startDate, // Added for raw date
                imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a',
                organizer: c.organizer?.name || 'Ban tổ chức',
                organizerId: c.organizerId, // CRITICAL: Added missing organizerId
                priceStr: minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} VND` : 'Liên hệ',
                category: c.categories.length > 0 ? c.categories[0].name : 'Nhạc Sống',
                categoryIds: c.categories.map(cat => cat.slug),
                hashtags: c.hashtags || []
            };
        });

        await this.redisService.set(this.CACHE_KEY, responseData, this.CACHE_TTL);

        return responseData;
    }
}
