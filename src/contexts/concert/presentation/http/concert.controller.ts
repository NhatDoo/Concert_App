import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateConcertCommand } from '../../application/commands/create-concert.command';
import { CreateConcertDto } from './dto/create-concert.dto';

@ApiTags('Concerts')
@Controller('concerts')
export class ConcertController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new concert' })
    @ApiResponse({ status: 201, description: 'Concert successfully created, returning concert ID' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. date in the past)' })
    async createConcert(@Body() dto: CreateConcertDto): Promise<{ message: string, concertId: string }> {
        // Date parsing is naturally a string from JSON body if it's just a DTO, Map it correctly to JS Date
        const parsedDate = new Date(dto.startDate);

        const command = new CreateConcertCommand(
            dto.organizerId,
            dto.name,
            parsedDate,
            dto.location
        );

        const concertId = await this.commandBus.execute(command);

        return {
            message: 'Concert successfully created',
            concertId
        };
    }
}
