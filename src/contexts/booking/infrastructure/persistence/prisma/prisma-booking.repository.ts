import { Injectable } from '@nestjs/common';
import { IBookingRepository } from '../../../domain/repository/booking.repository.interface';
import { Booking as BookingAggregate } from '../../../domain/aggregate/booking.aggregate';
import { BookingId } from '../../../domain/VO/booking-id.vo';
import { PrismaService } from '../../../../../prisma.service';
import { BookingMapper } from './booking.mapper';
import { BookingConcurrencyException } from '../../../domain/exception/booking-concurrency.exception';

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: BookingId): Promise<BookingAggregate | null> {
        const raw = await this.prisma.booking.findUnique({
            where: { id: id.getString() },
            include: { tickets: true }
        });

        if (!raw) return null;
        return BookingMapper.toDomain(raw);
    }

    async findByUserId(userId: string): Promise<BookingAggregate[]> {
        const raws = await this.prisma.booking.findMany({
            where: { userId },
            include: { tickets: true }
        });

        return raws.map(raw => BookingMapper.toDomain(raw));
    }

    async save(booking: BookingAggregate): Promise<void> {
        const persistence = BookingMapper.toPersistence(booking);
        const tickets = booking.getTickets();

        await this.prisma.$transaction(async (tx) => {
            const existing = await tx.booking.findUnique({
                where: { id: persistence.id },
                select: { id: true, version: true }
            });

            if (!existing) {
                // Create new booking
                await tx.booking.create({
                    data: {
                        id: persistence.id,
                        userId: persistence.userId,
                        concertId: persistence.concertId,
                        totalAmount: persistence.totalAmount,
                        status: persistence.status,
                        version: 1, // Default version
                        createdAt: persistence.createdAt,
                        tickets: {
                            create: tickets.map(t => ({
                                id: t.getId(),
                                userId: t.getUserId(),
                                concertId: t.getConcertId(),
                                ticketType: t.getTicketType().getValue(),
                                price: t.getPrice().getAmount(),
                                version: 1
                            }))
                        }
                    }
                });
            } else {
                // Optimistic Locking Check
                if (existing.version !== persistence.version) {
                    throw new BookingConcurrencyException(persistence.id);
                }

                // Update booking
                const updateResult = await tx.booking.updateMany({
                    where: {
                        id: persistence.id,
                        version: persistence.version
                    },
                    data: {
                        userId: persistence.userId,
                        concertId: persistence.concertId,
                        totalAmount: persistence.totalAmount,
                        status: persistence.status,
                        version: { increment: 1 }
                    }
                });

                if (updateResult.count === 0) {
                    throw new BookingConcurrencyException(persistence.id);
                }

                // Sync tickets (Recreate approach for aggregate consistency)
                await tx.ticket.deleteMany({
                    where: { bookingId: persistence.id }
                });

                await tx.ticket.createMany({
                    data: tickets.map(t => ({
                        id: t.getId(),
                        bookingId: persistence.id,
                        userId: t.getUserId() || null,
                        concertId: t.getConcertId(),
                        ticketType: t.getTicketType().getValue(),
                        price: t.getPrice().getAmount(),
                        version: 1
                    }))
                });
            }
        });
    }

    async delete(id: BookingId): Promise<void> {
        await this.prisma.booking.delete({
            where: { id: id.getString() }
        });
    }
}
