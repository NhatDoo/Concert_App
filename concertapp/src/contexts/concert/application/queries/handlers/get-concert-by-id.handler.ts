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
                seats: {
                    orderBy: { label: 'asc' }
                },
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

        const tickets = concert.seats.length > 0
            ? Array.from(
                concert.seats.reduce((map, seat) => {
                    const existing = map.get(seat.ticketType) || {
                        ticketType: seat.ticketType,
                        price: seat.price,
                        total: 0,
                        available: 0,
                        sold: 0,
                    };

                    existing.total += 1;
                    existing.price = Math.min(existing.price, seat.price);
                    if (seat.status === 'BOOKED') {
                        existing.sold += 1;
                    } else {
                        existing.available += 1;
                    }

                    map.set(seat.ticketType, existing);
                    return map;
                }, new Map<string, { ticketType: string; price: number; total: number; available: number; sold: number }>())
                    .values()
            )
            : concert.ticketPools.map(p => ({
                ticketType: p.ticketType,
                price: p.price,
                total: p.totalQuantity,
                available: p.totalQuantity - p.soldCount,
                sold: p.soldCount,
            }));

        // Map Prisma format
        const responseData = {
            id: concert.id,
            name: concert.name,
            startDate: concert.startDate,
            location: concert.location,
            imageUrl: concert.imageUrl,
            seatMapUrl: concert.seatMapUrl,
            organizerId: concert.organizerId,
            organizer: concert.organizer?.name || 'Chưa cập nhật',
            tickets,
            seats: concert.seats.map(seat => ({
                id: seat.id,
                label: seat.label,
                ticketType: seat.ticketType,
                price: seat.price,
                status: seat.status,
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
