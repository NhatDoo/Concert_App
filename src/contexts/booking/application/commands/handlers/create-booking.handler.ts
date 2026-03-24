import { Inject } from '@nestjs/common';
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

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
    constructor(
        @Inject(IBOOKING_REPOSITORY) private readonly repository: IBookingRepository,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: CreateBookingCommand): Promise<string> {
        const { userId, concertId, ticketIds } = command;

        console.log(`Executing CreateBookingCommand for User: ${userId}, Concert: ${concertId}`);

        // TODO: In a real system, you'd fetch the tickets' real prices/types from Concert Module.
        // Or if ticketIds are pre-existing entity IDs waiting to be booked, fetch from TicketRepository.
        // For demonstration of DDD, we will create new ticket entities here assuming uniform price/type.
        const tickets = ticketIds.map(id =>
            Ticket.create(
                id,                 // Real: Use existing ID or generate one
                concertId,          // Concert mapped
                userId,             // User mapped
                Money.create(150000), // Mock Price
                Tickettype.Regular  // Mock Type
            )
        );

        // 1. Build Aggregate using Factory Method
        const bookingIdString = uuidv4();
        const booking = Booking.create(
            BookingId.create(bookingIdString),
            UserId.create(userId),
            ConcertId.create(concertId),
            tickets
        );

        // 2. Wrap the aggregate in CQRS Event Publisher
        const bookingPublisher = this.publisher.mergeObjectContext(booking);

        // 3. Save Aggregate to Database via Repository (Optimistic Locking included)
        await this.repository.save(booking);

        // 4. Commit Domain Events (e.g. triggers listeners if they exist)
        bookingPublisher.commit();

        console.log(`Successfully created BookingID: ${bookingIdString}`);
        return bookingIdString;
    }
}
