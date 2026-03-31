import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizerStatsQuery } from '../get-organizer-stats.query';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetOrganizerStatsQuery)
export class GetOrganizerStatsHandler implements IQueryHandler<GetOrganizerStatsQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: GetOrganizerStatsQuery) {
        const { organizerId } = query;

        // 1. Tìm tất cả các concert của organizer này
        const concerts = await this.prisma.concert.findMany({
            where: { organizerId },
            include: {
                ticketPools: true
            }
        });

        // 2. Tính toán thống kê
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        const totalConcerts = concerts.length;

        concerts.forEach(concert => {
            concert.ticketPools.forEach(pool => {
                totalTicketsSold += pool.soldCount;
                totalRevenue += (pool.price * pool.soldCount);
            });
        });

        const activeConcertsCount = concerts.filter(c => new Date(c.startDate) > new Date()).length;

        return {
            totalTicketsSold,
            totalRevenue,
            totalConcerts,
            activeConcerts: activeConcertsCount,
            completedConcerts: totalConcerts - activeConcertsCount
        };
    }
}
