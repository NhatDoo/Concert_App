import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingInfrastructureModule } from './infrastructure/booking-infrastructure.module';
import { BookingController } from './presentation/http/booking.controller';
import { CreateBookingHandler } from './application/commands/handlers/create-booking.handler';
import { CancelBookingHandler } from './application/commands/handlers/cancel-booking.handler';

export const CommandHandlers = [CreateBookingHandler, CancelBookingHandler];

@Module({
    imports: [
        CqrsModule,
        BookingInfrastructureModule
    ],
    controllers: [
        BookingController
    ],
    providers: [
        ...CommandHandlers
    ]
})
export class BookingModule { }
