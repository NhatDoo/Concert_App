import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ConfirmBookingCommand } from '../confirm-booking.command';
import { IBOOKING_REPOSITORY } from '../../../domain/repository/booking.repository.interface';
import type { IBookingRepository } from '../../../domain/repository/booking.repository.interface';
import { BookingId } from '../../../domain/VO/booking-id.vo';

@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmBookingCommand> {
    constructor(
        @Inject(IBOOKING_REPOSITORY) private readonly repository: IBookingRepository,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: ConfirmBookingCommand): Promise<void> {
        const { bookingId } = command;

        const bookingIdVO = BookingId.create(bookingId);
        const booking = await this.repository.findById(bookingIdVO);
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        // Apply domain logic and events
        booking.confirm();

        await this.repository.save(booking);

        this.publisher.mergeObjectContext(booking).commit();

        console.log(`Booking ${bookingId} confirmed.`);
    }
}
