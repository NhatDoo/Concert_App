import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConcertStaffQuery } from '../get-concert-staff.query';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetConcertStaffQuery)
export class GetConcertStaffHandler implements IQueryHandler<GetConcertStaffQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: GetConcertStaffQuery) {
        const { concertId } = query;

        const staff = await this.prisma.staff.findMany({
            where: { concertId },
            include: {
                tasks: true
            }
        });

        return staff.map(s => ({
            id: s.id,
            userId: s.userId,
            name: s.name,
            role: s.role,
            tasks: s.tasks.map(t => ({
                id: t.id,
                description: t.description,
                status: t.status
            }))
        }));
    }
}
