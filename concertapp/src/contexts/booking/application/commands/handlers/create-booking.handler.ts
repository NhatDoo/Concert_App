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
        const { userId, concertId, items } = command;

        console.log(`Executing CreateBookingCommand for User: ${userId}, Concert: ${concertId}`);

        // 1. Fetch available ticket pools for this concert
        const pools = await this.prisma.ticketPool.findMany({
            where: {
                concertId,
                ticketType: { in: items.map(i => i.ticketType) }
            }
        });

        if (pools.length === 0) {
            throw new NotFoundException(`No ticket pools found for Concert: ${concertId}`);
        }

        const tickets: Ticket[] = [];

        // 2. Map items to real tickets using current pool prices and check for availability
        for (const item of items) {
            const pool = pools.find(p => p.ticketType === item.ticketType);
            if (!pool) {
                throw new BadRequestException(`Ticket type "${item.ticketType}" not offered for this concert`);
            }

            const available = pool.totalQuantity - pool.soldCount;
            if (available < item.quantity) {
                throw new ConflictException(`Only ${available} tickets left for type "${item.ticketType}"`);
            }

            // Generate "quantity" of tickets
            for (let i = 0; i < item.quantity; i++) {
                tickets.push(Ticket.create(
                    uuidv4(),
                    concertId,
                    userId,
                    Money.create(pool.price),
                    Tickettype.from(pool.ticketType)
                ));
            }
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
