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

        // 3. Staff and Task Stats
        const staffMembers = await this.prisma.staff.findMany({
            where: { organizerId },
            include: {
                tasks: true,
                user: true,
                concert: true
            }
        });

        const totalStaff = staffMembers.length;
        let totalTasks = 0;
        let completedTasks = 0;

        const staffDetails = staffMembers.map(staff => {
            const sTasks = staff.tasks || [];
            const sCompleted = sTasks.filter(t => t.status === 'COMPLETED').length;
            const sTotal = sTasks.length;

            totalTasks += sTotal;
            completedTasks += sCompleted;

            return {
                id: staff.id,
                name: staff.name,
                email: staff.user?.email || 'N/A',
                role: staff.role,
                concertId: staff.concertId,
                concertName: staff.concert?.name || 'Chưa gán sự kiện',
                totalTasks: sTotal,
                completedTasks: sCompleted,
                rate: sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0
            };
        });

        const pendingTasks = totalTasks - completedTasks;

        return {
            totalTicketsSold,
            totalRevenue,
            totalConcerts,
            activeConcerts: activeConcertsCount,
            completedConcerts: totalConcerts - activeConcertsCount,
            staffStats: {
                totalStaff,
                totalTasks,
                completedTasks,
                pendingTasks,
                taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                staffDetails
            }
        };
    }
}
