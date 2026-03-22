import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../create-booking.command';
import { Booking } from '../../../domain/aggregate/booking.aggregate';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
    // Inject repository here, e.g. constructor(private bookingRepository: BookingRepository) {}

    async execute(command: CreateBookingCommand): Promise<void> {
        const { userId, concertId, ticketIds } = command;

        console.log(`Executing CreateBookingCommand for User: ${userId}, Concert: ${concertId}`);

        // Example logic using aggregate:
        // const newBookingId = Math.floor(Math.random() * 1000);
        // const tickets = await this.ticketRepository.findByIds(ticketIds);
        // const booking = Booking.create(newBookingId, userId, concertId, tickets);
        // await this.bookingRepository.save(booking);

        // Event bus or standard events might also be dispatched
    }
}
