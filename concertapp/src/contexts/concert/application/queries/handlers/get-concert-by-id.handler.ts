import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConcertByIdQuery } from '../get-concert-by-id.query';
import { PrismaService } from '../../../../../prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetConcertByIdQuery)
export class GetConcertByIdHandler implements IQueryHandler<GetConcertByIdQuery> {
    private readonly CACHE_TTL = 300;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async execute(query: GetConcertByIdQuery): Promise<any> {
        const cacheKey = `concert:${query.id}:v2`;

        // 1. Check Redis Cache
        const cached = await this.redisService.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // 2. Fetch from Database
        const concert = await this.prisma.concert.findUnique({
            where: { id: query.id },
            include: {
                organizer: true,
                ticketPools: true,
                performances: {
                    include: {
                        artist: true
                    }
                }
            }
        });

        if (!concert) {
            throw new NotFoundException('Concert not found');
        }

        // Map Prisma format
        const responseData = {
            id: concert.id,
            name: concert.name,
            startDate: concert.startDate,
            location: concert.location,
            imageUrl: concert.imageUrl,
            organizerId: concert.organizerId,
            organizer: concert.organizer?.name || 'Chưa cập nhật',
            tickets: concert.ticketPools.map(p => ({
                ticketType: p.ticketType,
                price: p.price,
                total: p.totalQuantity,
                available: p.totalQuantity - p.soldCount,
                sold: p.soldCount,
            })),
            performances: concert.performances.map(p => ({
                id: p.id,
                name: p.name,
                durationMinutes: p.durationMinutes,
                startTime: p.startTime,
                artistName: p.artist.name
            }))
        };

        // 3. Save to Redis
        await this.redisService.set(cacheKey, responseData, this.CACHE_TTL);

        return responseData;
    }
}
