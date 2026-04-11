import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketsByConcertQuery } from '../get-tickets-by-concert.query';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetTicketsByConcertQuery)
export class GetTicketsByConcertHandler implements IQueryHandler<GetTicketsByConcertQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: GetTicketsByConcertQuery): Promise<any[]> {
        const seats = await this.prisma.seat.findMany({
            where: { concertId: query.concertId },
            orderBy: [{ ticketType: 'asc' }, { label: 'asc' }],
        });

        if (seats.length > 0) {
            return Array.from(
                seats.reduce((map, seat) => {
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
            );
        }

        const pools = await this.prisma.ticketPool.findMany({
            where: { concertId: query.concertId },
            orderBy: { ticketType: 'asc' },
        });

        return pools.map(p => ({
            ticketType: p.ticketType,
            price: p.price,
            total: p.totalQuantity,
            available: p.totalQuantity - p.soldCount,
            sold: p.soldCount,
        }));
    }
}
