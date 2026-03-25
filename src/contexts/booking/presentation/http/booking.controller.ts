import { Body, Controller, Post, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBookingCommand } from '../../application/commands/create-booking.command';
import { CancelBookingCommand } from '../../application/commands/cancel-booking.command';
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

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel an existing Booking' })
    @ApiResponse({ status: 200, description: 'Booking successfully cancelled' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async cancelBooking(
        @Param('id') bookingId: string,
        @Body('userId') userId: string
    ) {
        const command = new CancelBookingCommand(bookingId, userId);
        await this.commandBus.execute(command);

        return {
            message: 'Booking successfully cancelled'
        };
    }
}
