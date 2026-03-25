import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancel-booking.command';
import { IBOOKING_REPOSITORY } from '../../../domain/repository/booking.repository.interface';
import type { IBookingRepository } from '../../../domain/repository/booking.repository.interface';
import { BookingId } from '../../../domain/VO/booking-id.vo';

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
    constructor(
        @Inject(IBOOKING_REPOSITORY) private readonly repository: IBookingRepository,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: CancelBookingCommand): Promise<void> {
        const { bookingId, userId } = command;

        const booking = await this.repository.findById(BookingId.create(bookingId));

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.getUserId().getString() !== userId) {
            throw new UnauthorizedException('You can only cancel your own bookings');
        }

        // Domain magic
        booking.cancel();

        // CQRS Publisher
        const bookingPublisher = this.publisher.mergeObjectContext(booking);

        // Save
        await this.repository.save(booking);

        // Commit Domain Events
        bookingPublisher.commit();
    }
}
