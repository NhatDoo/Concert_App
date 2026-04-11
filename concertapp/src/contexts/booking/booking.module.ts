import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingInfrastructureModule } from './infrastructure/booking-infrastructure.module';
import { IdentityInfrastructureModule } from '../identity/infrastructure/identity-infrastructure.module';
import { BookingController } from './presentation/http/booking.controller';
import { CreateBookingHandler } from './application/commands/handlers/create-booking.handler';
import { CancelBookingHandler } from './application/commands/handlers/cancel-booking.handler';
import { ConfirmBookingHandler } from './application/commands/handlers/confirm-booking.handler';
import { GetBookingsByUserHandler } from './application/queries/handlers/get-bookings-by-user.handler';

export const CommandHandlers = [CreateBookingHandler, CancelBookingHandler, ConfirmBookingHandler];
export const QueryHandlers = [GetBookingsByUserHandler];

@Module({
    imports: [
        CqrsModule,
        BookingInfrastructureModule,
        IdentityInfrastructureModule,
    ],
    controllers: [
        BookingController
    ],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers
    ]
})
export class BookingModule { }
