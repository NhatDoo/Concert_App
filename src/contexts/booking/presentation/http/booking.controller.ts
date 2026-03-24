import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBookingCommand } from '../../application/commands/create-booking.command';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new ticket booking' })
    @ApiResponse({ status: 201, description: 'Booking successfully created' })
    @ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
    async createBooking(@Body() dto: CreateBookingDto) {
        // Dispatch the CQRS command to the proper handler
        const command = new CreateBookingCommand(
            dto.userId,
            dto.concertId,
            dto.ticketIds
        );

        const bookingId = await this.commandBus.execute(command);

        return {
            message: 'Booking successfully created',
            bookingId: bookingId
        };
    }
}
