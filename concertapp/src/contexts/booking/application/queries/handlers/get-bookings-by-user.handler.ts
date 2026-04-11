import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBookingsByUserQuery } from '../get-bookings-by-user.query';
import { IBOOKING_REPOSITORY } from '../../../domain/repository/booking.repository.interface';
import type { IBookingRepository } from '../../../domain/repository/booking.repository.interface';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetBookingsByUserQuery)
export class GetBookingsByUserHandler implements IQueryHandler<GetBookingsByUserQuery> {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(query: GetBookingsByUserQuery): Promise<any[]> {
        // Fetch bookings with their tickets and concert details
        const bookings = await this.prisma.booking.findMany({
            where: { userId: query.userId },
            include: {
                tickets: true,
                invoices: {
                    select: { id: true, status: true },
                    orderBy: { issueDate: 'desc' },
                    take: 1
                },
                concert: {
                    select: {
                        name: true,
                        startDate: true,
                        location: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return bookings.map(b => ({
            id: b.id,
            invoiceId: b.invoices.length > 0 ? b.invoices[0].id : null,
            concertName: b.concert.name,
            concertDate: b.concert.startDate,
            concertLocation: b.concert.location,
            concertImage: b.concert.imageUrl,
            totalAmount: b.totalAmount,
            status: b.status,
            createdAt: b.createdAt,
            tickets: b.tickets.map(t => ({
                id: t.id,
                type: t.ticketType,
                price: t.price,
                seatId: t.seatId,
                seatLabel: t.seatLabel,
            }))
        }));
    }
}

