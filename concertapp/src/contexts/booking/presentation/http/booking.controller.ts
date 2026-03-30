import { Body, Controller, Post, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBookingCommand } from '../../application/commands/create-booking.command';
import { CancelBookingCommand } from '../../application/commands/cancel-booking.command';
import { GetBookingsByUserQuery } from '../../application/queries/get-bookings-by-user.query';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

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
            dto.items
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

    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all bookings for a user' })
    async getMyBookings(@Param('userId') userId: string) {
        return this.queryBus.execute(new GetBookingsByUserQuery(userId));
    }
}
