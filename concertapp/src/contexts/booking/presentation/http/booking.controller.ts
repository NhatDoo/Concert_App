import { Body, Controller, Post, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/infrastructure/auth/jwt-auth.guard';
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new ticket booking' })
    @ApiResponse({ status: 201, description: 'Booking successfully created' })
    @ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createBooking(@Body() dto: CreateBookingDto) {
        // Dispatch the CQRS command to the proper handler
        const command = new CreateBookingCommand(
            dto.userId,
            dto.concertId,
            dto.seatIds
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all bookings for a user' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyBookings(@Param('userId') userId: string) {
        return this.queryBus.execute(new GetBookingsByUserQuery(userId));
    }
}
