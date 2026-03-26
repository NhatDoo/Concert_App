import { Module } from '@nestjs/common';
import { PrismaBookingRepository } from './persistence/prisma/prisma-booking.repository';
import { IBOOKING_REPOSITORY } from '../domain/repository/booking.repository.interface';
import { PrismaService } from '../../../prisma.service';

@Module({
    providers: [
        PrismaService,
        {
            provide: IBOOKING_REPOSITORY,
            useClass: PrismaBookingRepository,
        },
    ],
    exports: [IBOOKING_REPOSITORY],
})
export class BookingInfrastructureModule { }
