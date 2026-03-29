import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketsByConcertQuery } from '../get-tickets-by-concert.query';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetTicketsByConcertQuery)
export class GetTicketsByConcertHandler implements IQueryHandler<GetTicketsByConcertQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: GetTicketsByConcertQuery): Promise<any[]> {
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
