import { Controller, Post, Put, Body, HttpCode, HttpStatus, Param, Get, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateConcertCommand } from '../../application/commands/create-concert.command';
import { GenerateTicketsCommand } from '../../application/commands/generate-tickets.command';
import { CreateArtistCommand, UpdateArtistCommand } from '../../application/commands/artist.command';
import { AddPerformanceCommand, UpdatePerformanceScheduleCommand } from '../../application/commands/performance.command';
import { CreateConcertDto } from './dto/create-concert.dto';
import { GenerateTicketsDto } from './dto/generate-tickets.dto';
import { CreateArtistDto, UpdateArtistDto } from './dto/artist.dto';
import { AddPerformanceDto, UpdatePerformanceScheduleDto } from './dto/performance.dto';
import { Tickettype } from '../../../booking/domain/VO/tickettype.vo';
import { Money } from '../../../../common/domain/value-object/money.vo';
import { IARTIST_REPOSITORY } from '../../domain/repository/artist.repository.interface';
import type { IArtistRepository } from '../../domain/repository/artist.repository.interface';
import { IPERFORMANCE_REPOSITORY } from '../../domain/repository/performance.repository.interface';
import type { IPerformanceRepository } from '../../domain/repository/performance.repository.interface';

@ApiTags('Concerts')
@Controller('concerts')
export class ConcertController {
    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IARTIST_REPOSITORY) private readonly artistRepo: IArtistRepository,
        @Inject(IPERFORMANCE_REPOSITORY) private readonly performanceRepo: IPerformanceRepository,
    ) { }

    // ==================== CONCERT ====================
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new concert' })
    @ApiResponse({ status: 201, description: 'Concert successfully created, returning concert ID' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. date in the past)' })
    async createConcert(@Body() dto: CreateConcertDto): Promise<{ message: string, concertId: string }> {
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

    @Post(':id/tickets')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Generate purchasable tickets for a concert' })
    @ApiResponse({ status: 201, description: 'Tickets successfully generated' })
    @ApiBody({ type: GenerateTicketsDto })
    async generateTickets(
        @Param('id') concertId: string,
        @Body() dto: GenerateTicketsDto
    ) {
        const domainDTO = dto.ticketTypes.map(t => ({
            type: new Tickettype(t.type),
            price: Money.create(t.price),
            quantity: t.quantity
        }));

        const command = new GenerateTicketsCommand(concertId, domainDTO);
        await this.commandBus.execute(command);

        return {
            message: 'Tickets successfully generated for the concert'
        };
    }

    // ==================== ARTIST ====================
    @Post('artists')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new artist' })
    @ApiResponse({ status: 201, description: 'Artist created' })
    async createArtist(@Body() dto: CreateArtistDto) {
        const command = new CreateArtistCommand(dto.name, dto.bio ?? '', dto.contactInfo ?? '');
        const artistId = await this.commandBus.execute(command);
        return { message: 'Artist created', artistId };
    }

    @Get('artists')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all artists' })
    async getAllArtists() {
        const artists = await this.artistRepo.findAll();
        return artists.map(a => ({
            id: a.getId(),
            name: a.getName(),
            bio: a.getBio(),
            contactInfo: a.getContactInfo()
        }));
    }

    @Get('artists/:artistId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get artist by ID' })
    async getArtistById(@Param('artistId') artistId: string) {
        const artist = await this.artistRepo.findById(artistId);
        if (!artist) return { message: 'Artist not found' };
        return {
            id: artist.getId(),
            name: artist.getName(),
            bio: artist.getBio(),
            contactInfo: artist.getContactInfo()
        };
    }

    @Put('artists/:artistId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update artist details' })
    async updateArtist(@Param('artistId') artistId: string, @Body() dto: UpdateArtistDto) {
        const command = new UpdateArtistCommand(artistId, dto.name, dto.bio ?? '', dto.contactInfo ?? '');
        await this.commandBus.execute(command);
        return { message: 'Artist updated' };
    }

    // ==================== PERFORMANCE ====================
    @Post(':id/performances')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a performance to a concert' })
    @ApiResponse({ status: 201, description: 'Performance added' })
    async addPerformance(@Param('id') concertId: string, @Body() dto: AddPerformanceDto) {
        const command = new AddPerformanceCommand(
            concertId,
            dto.artistId,
            dto.name,
            dto.durationMinutes,
            new Date(dto.startTime)
        );
        const performanceId = await this.commandBus.execute(command);
        return { message: 'Performance added to concert', performanceId };
    }

    @Get(':id/performances')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all performances of a concert' })
    async getPerformances(@Param('id') concertId: string) {
        const performances = await this.performanceRepo.findByConcertId(concertId);
        return performances.map(p => ({
            id: p.getId(),
            concertId: p.getConcertId(),
            artistId: p.getArtistId(),
            name: p.getName(),
            durationMinutes: p.getDuration(),
            startTime: p.getStartTime()
        }));
    }

    @Put(':concertId/performances/:performanceId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update performance schedule' })
    async updatePerformanceSchedule(
        @Param('performanceId') performanceId: string,
        @Body() dto: UpdatePerformanceScheduleDto
    ) {
        const command = new UpdatePerformanceScheduleCommand(
            performanceId,
            new Date(dto.startTime),
            dto.durationMinutes
        );
        await this.commandBus.execute(command);
        return { message: 'Performance schedule updated' };
    }
}
