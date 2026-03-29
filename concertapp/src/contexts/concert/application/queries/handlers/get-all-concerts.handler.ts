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
            }
        });

      
        const responseData = concerts.map(c => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate,
            location: c.location,
            imageUrl: c.imageUrl,
            organizerId: c.organizerId,
            organizer: c.organizer?.name || 'Chưa cập nhật'
        }));

        await this.redisService.set(this.CACHE_KEY, responseData, this.CACHE_TTL);

        return responseData;
    }
}
