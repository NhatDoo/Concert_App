import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRequirementsQuery } from '../get-requirements.query';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetRequirementsQuery)
export class GetRequirementsHandler implements IQueryHandler<GetRequirementsQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: GetRequirementsQuery): Promise<any[]> {
        const { filters } = query;
        let whereClause: any = {};

        if (filters.concertId) whereClause.concertId = filters.concertId;
        if (filters.vendorId) whereClause.vendorId = filters.vendorId;
        if (filters.status) whereClause.status = filters.status;

        return this.prisma.eventRequirement.findMany({
            where: whereClause,
            include: {
                concert: {
                    select: { id: true, name: true, startDate: true, location: true }
                },
                author: {
                    select: { id: true, name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
