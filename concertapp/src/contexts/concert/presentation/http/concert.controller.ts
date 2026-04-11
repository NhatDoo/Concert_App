import { Controller, Post, Put, Delete, Body, HttpCode, HttpStatus, Param, Get, Inject, UseInterceptors, UploadedFile, Query, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateConcertCommand } from '../../application/commands/create-concert.command';
import { UpdateConcertCommand } from '../../application/commands/update-concert.command';
import { GenerateTicketsCommand } from '../../application/commands/generate-tickets.command';
import { GetAllConcertsQuery } from '../../application/queries/get-all-concerts.query';
import { GetConcertByIdQuery } from '../../application/queries/get-concert-by-id.query';
import { GetTicketsByConcertQuery } from '../../application/queries/get-tickets-by-concert.query';
import { SearchConcertQuery } from '../../application/queries/search-concert.query';
import { DeleteTicketTypeCommand } from '../../application/commands/delete-ticket-type.command';
import { UpdateTicketPriceCommand } from '../../application/commands/update-ticket-price.command';
import { CreateArtistCommand, UpdateArtistCommand, DeleteArtistCommand } from '../../application/commands/artist.command';
import { AddPerformanceCommand, UpdatePerformanceScheduleCommand, RemovePerformanceCommand } from '../../application/commands/performance.command';
import { SyncElasticsearchCommand } from '../../application/commands/sync-elasticsearch.command';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { GenerateTicketsDto } from './dto/generate-tickets.dto';
import { CreateArtistDto, UpdateArtistDto } from './dto/artist.dto';
import { AddPerformanceDto, UpdatePerformanceScheduleDto } from './dto/performance.dto';
import { Tickettype } from '../../../booking/domain/VO/tickettype.vo';
import { Money } from '../../../../common/domain/value-object/money.vo';
import { IARTIST_REPOSITORY } from '../../domain/repository/artist.repository.interface';
import type { IArtistRepository } from '../../domain/repository/artist.repository.interface';
import { IPERFORMANCE_REPOSITORY } from '../../domain/repository/performance.repository.interface';
import type { IPerformanceRepository } from '../../domain/repository/performance.repository.interface';
import { PrismaService } from '../../../../prisma.service';

@ApiTags('Concerts')
@Controller('concerts')
export class ConcertController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @Inject(IARTIST_REPOSITORY) private readonly artistRepo: IArtistRepository,
        @Inject(IPERFORMANCE_REPOSITORY) private readonly performanceRepo: IPerformanceRepository,
        private readonly prisma: PrismaService,
    ) { }

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

    @Delete('artists/:artistId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an artist' })
    async deleteArtist(@Param('artistId') artistId: string) {
        await this.commandBus.execute(new DeleteArtistCommand(artistId));
        return { message: 'Artist deleted' };
    }

    // ==================== SYNC ====================
    @Post('sync-es')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Trigger a manual sync of all concerts to Elasticsearch' })
    async syncElasticsearch() {
        const count = await this.commandBus.execute(new SyncElasticsearchCommand());
        return { message: 'Elasticsearch sync completed', count };
    }

    // ==================== CONCERT ====================
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all concerts (with Redis caching)' })
    @ApiResponse({ status: 200, description: 'Return all concerts' })
    async getAllConcerts() {
        return this.queryBus.execute(new GetAllConcertsQuery());
    }

    @Get('organizer/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all concerts by organizer ID' })
    async getConcertsByOrganizer(@Param('organizerId') organizerId: string) {
        const concerts = await this.prisma.concert.findMany({
            where: { organizerId },
            orderBy: { startDate: 'desc' },
            include: {
                organizer: { select: { id: true, name: true } },
                categories: true
            }
        });
        return concerts.map(c => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate,
            location: c.location,
            imageUrl: c.imageUrl,
            organizerId: c.organizerId,
            categoryIds: c.categories.map(cat => cat.slug),
            hashtags: c.hashtags || []
        }));
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search concerts by name or location (Optimized with Bloom Filter)' })
    async searchConcerts(@Query('query') searchTerm: string) {
        return this.queryBus.execute(new SearchConcertQuery(searchTerm));
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get concert details & tickets by ID' })
    async getConcertById(@Param('id') id: string) {
        return this.queryBus.execute(new GetConcertByIdQuery(id));
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ summary: 'Create a new concert' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Concert successfully created, returning concert ID' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. date in the past)' })
    async createConcert(
        @Body() dto: CreateConcertDto,
        @UploadedFile() image?: Express.Multer.File,
    ): Promise<{ message: string, concertId: string }> {
        const parsedDate = new Date(dto.startDate);

        const command = new CreateConcertCommand(
            dto.organizerId,
            dto.name,
            parsedDate,
            dto.location,
            image,
            dto.categories ? JSON.parse(dto.categories) : [],
            dto.hashtags ? dto.hashtags.split(/[\s,]+/).filter(tag => tag.trim() !== '') : [],
        );

        const concertId = await this.commandBus.execute(command);

        return {
            message: 'Concert successfully created',
            concertId
        };
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update an existing concert' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 200, description: 'Concert successfully updated' })
    async updateConcert(
        @Param('id') id: string,
        @Body() dto: UpdateConcertDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
                fileIsRequired: false,
            }),
        ) image?: Express.Multer.File,
    ) {
        let parsedDate: Date | undefined;
        if (dto.startDate) {
            parsedDate = new Date(dto.startDate);
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid start date format');
            }
        }

        const command = new UpdateConcertCommand(
            id,
            (dto as any).organizerId,
            dto.name,
            parsedDate,
            dto.location,
            image,
            dto.categories ? JSON.parse(dto.categories) : undefined,
            dto.hashtags ? dto.hashtags.split(/[\s,]+/).filter(tag => tag.trim() !== '') : undefined,
        );

        return this.commandBus.execute(command);
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

    @Get(':id/tickets')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all ticket types & stats for a concert (organizer view)' })
    async getTicketsByConcert(@Param('id') concertId: string) {
        return this.queryBus.execute(new GetTicketsByConcertQuery(concertId));
    }

    @Put(':id/tickets/:ticketType')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update price and/or quantity of a ticket type' })
    @ApiBody({ schema: { properties: { price: { type: 'number' }, quantity: { type: 'number' } } } })
    async updateTicket(
        @Param('id') concertId: string,
        @Param('ticketType') ticketType: string,
        @Body() body: { price: number; quantity?: number }
    ) {
        await this.commandBus.execute(new UpdateTicketPriceCommand(concertId, ticketType, body.price, body.quantity));
        return { message: 'Ticket type updated successfully' };
    }

    @Delete(':id/tickets/:ticketType')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all unsold tickets of a type for a concert' })
    async deleteTicketType(
        @Param('id') concertId: string,
        @Param('ticketType') ticketType: string
    ) {
        await this.commandBus.execute(new DeleteTicketTypeCommand(concertId, ticketType));
        return { message: `Ticket type "${ticketType}" deleted` };
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

    @Delete(':concertId/performances/:performanceId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a performance from a concert' })
    async removePerformance(@Param('performanceId') performanceId: string) {
        await this.commandBus.execute(new RemovePerformanceCommand(performanceId));
        return { message: 'Performance removed from concert' };
    }
}
