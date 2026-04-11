import { Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingCommand } from '../create-booking.command';
import { IBOOKING_REPOSITORY } from '../../../domain/repository/booking.repository.interface';
import type { IBookingRepository } from '../../../domain/repository/booking.repository.interface';
import { Booking } from '../../../domain/aggregate/booking.aggregate';
import { BookingId } from '../../../domain/VO/booking-id.vo';
import { UserId } from '../../../../identity/domain/VO/user-id.vo';
import { ConcertId } from '../../../../concert/domain/VO/concert-id.vo';
import { Ticket } from '../../../domain/entity/ticket.entity';
import { Tickettype } from '../../../domain/VO/tickettype.vo';
import { Money } from '../../../../../common/domain/value-object/money.vo';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
    constructor(
        @Inject(IBOOKING_REPOSITORY) private readonly repository: IBookingRepository,
        private readonly publisher: EventPublisher,
        private readonly prisma: PrismaService,
    ) { }

    async execute(command: CreateBookingCommand): Promise<string> {
        const { userId, concertId, seatIds } = command;

        console.log(`Executing CreateBookingCommand for User: ${userId}, Concert: ${concertId}`);

        const seats = await this.prisma.seat.findMany({
            where: {
                concertId,
                id: { in: seatIds },
            },
        });

        if (seats.length !== seatIds.length) {
            throw new NotFoundException(`Some seats were not found for Concert: ${concertId}`);
        }

        const duplicateSeatIds = seatIds.filter((seatId, index) => seatIds.indexOf(seatId) !== index);
        if (duplicateSeatIds.length > 0) {
            throw new BadRequestException('Duplicate seats are not allowed in one booking');
        }

        const tickets: Ticket[] = [];
        for (const seat of seats) {
            if (seat.status === 'BOOKED') {
                throw new ConflictException(`Seat "${seat.label}" is already booked`);
            }

            tickets.push(Ticket.create(
                uuidv4(),
                concertId,
                userId,
                Money.create(seat.price),
                Tickettype.from(seat.ticketType),
                seat.id,
                seat.label
            ));
        }

        // 3. Build Aggregate using Factory Method
        const bookingIdString = uuidv4();
        const booking = Booking.create(
            BookingId.create(bookingIdString),
            UserId.create(userId),
            ConcertId.create(concertId),
            tickets
        );

        // 4. Wrap the aggregate in CQRS Event Publisher
        const bookingPublisher = this.publisher.mergeObjectContext(booking);

        // 5. Save Aggregate to Database via Repository (Optimistic Locking included)
        await this.repository.save(booking);

        // 6. Commit Domain Events
        bookingPublisher.commit();

        console.log(`Successfully created BookingID: ${bookingIdString}`);
        return bookingIdString;
    }
}
