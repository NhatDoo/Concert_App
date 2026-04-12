import { Controller, Post, Put, Delete, Body, HttpCode, HttpStatus, Param, Get, Inject, UseInterceptors, UploadedFiles, Query, BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { RedisService } from '../../infrastructure/redis/redis.service';

@ApiTags('Concerts')
@Controller('concerts')
export class ConcertController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @Inject(IARTIST_REPOSITORY) private readonly artistRepo: IArtistRepository,
        @Inject(IPERFORMANCE_REPOSITORY) private readonly performanceRepo: IPerformanceRepository,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    private parseJsonArray<T>(raw: string | undefined, fieldName: string): T[] | undefined {
        if (!raw) return undefined;

        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                throw new BadRequestException(`${fieldName} must be a JSON array`);
            }
            return parsed as T[];
        } catch {
            throw new BadRequestException(`${fieldName} must be valid JSON`);
        }
    }

    private parseHashtags(raw?: string): string[] | undefined {
        if (!raw) return undefined;
        return raw.split(/[\s,]+/).filter(tag => tag.trim() !== '');
    }

    private parseSeats(raw?: string): Array<{ label: string; ticketType: string; price: number }> | undefined {
        const seats = this.parseJsonArray<{ label: string; ticketType: string; price: number }>(raw, 'seats');
        if (!seats) return undefined;

        const normalizedSeats = seats.map((seat, index) => {
            if (!seat?.label || !seat?.ticketType || typeof seat?.price !== 'number' || Number.isNaN(seat.price)) {
                throw new BadRequestException(`Seat at index ${index} is invalid`);
            }

            return {
                label: seat.label.trim(),
                ticketType: seat.ticketType.trim(),
                price: seat.price,
            };
        });

        const labels = normalizedSeats.map(seat => seat.label);
        const hasDuplicates = new Set(labels).size !== labels.length;
        if (hasDuplicates) {
            throw new BadRequestException('Seat labels must be unique within a concert');
        }

        return normalizedSeats;
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
                categories: true,
                seats: {
                    orderBy: { label: 'asc' }
                }
            }
        });
        return concerts.map(c => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate,
            location: c.location,
            imageUrl: c.imageUrl,
            seatMapUrl: c.seatMapUrl,
            seats: c.seats.map(seat => ({
                id: seat.id,
                label: seat.label,
                ticketType: seat.ticketType,
                price: seat.price,
                status: seat.status,
            })),
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
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'seatMap', maxCount: 1 },
    ]))
    @ApiOperation({ summary: 'Create a new concert' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Concert successfully created, returning concert ID' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. date in the past)' })
    async createConcert(
        @Body() dto: CreateConcertDto,
        @UploadedFiles() files?: { image?: Express.Multer.File[]; seatMap?: Express.Multer.File[] },
    ): Promise<{ message: string, concertId: string }> {
        const parsedDate = new Date(dto.startDate);
        const image = files?.image?.[0];
        const seatMap = files?.seatMap?.[0];

        const command = new CreateConcertCommand(
            dto.organizerId,
            dto.name,
            parsedDate,
            dto.location,
            image,
            seatMap,
            this.parseSeats(dto.seats) || [],
            this.parseJsonArray<string>(dto.categories, 'categories') || [],
            this.parseHashtags(dto.hashtags) || [],
        );

        const concertId = await this.commandBus.execute(command);

        return {
            message: 'Concert successfully created',
            concertId
        };
    }

    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'seatMap', maxCount: 1 },
    ]))
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update an existing concert' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 200, description: 'Concert successfully updated' })
    async updateConcert(
        @Param('id') id: string,
        @Body() dto: UpdateConcertDto,
        @UploadedFiles() files?: { image?: Express.Multer.File[]; seatMap?: Express.Multer.File[] },
    ) {
        const image = files?.image?.[0];
        const seatMap = files?.seatMap?.[0];
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
            seatMap,
            this.parseSeats(dto.seats),
            this.parseJsonArray<string>(dto.categories, 'categories'),
            this.parseHashtags(dto.hashtags),
        );

        return this.commandBus.execute(command);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a concert and all related data' })
    @ApiResponse({ status: 200, description: 'Concert deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete concert with active bookings' })
    async deleteConcert(@Param('id') concertId: string) {
        const concert = await this.prisma.concert.findUnique({ where: { id: concertId } });
        if (!concert) throw new BadRequestException(`Concert ${concertId} not found`);

        const activeBookings = await this.prisma.booking.count({
            where: { concertId, status: { in: ['PENDING', 'CONFIRMED'] } }
        });
        if (activeBookings > 0) {
            throw new BadRequestException(
                `Không thể xóa: còn ${activeBookings} booking đang hoạt động. Vui lòng hủy tất cả booking trước.`
            );
        }

        await this.prisma.$transaction(async (tx) => {
            const zones = await tx.zone.findMany({ where: { concertId }, select: { id: true } });
            const zoneIds = zones.map(z => z.id);
            if (zoneIds.length > 0) {
                const shifts = await tx.shift.findMany({ where: { zoneId: { in: zoneIds } }, select: { id: true } });
                const shiftIds = shifts.map(s => s.id);
                if (shiftIds.length > 0) {
                    await tx.shiftAssignment.deleteMany({ where: { shiftId: { in: shiftIds } } });
                    await tx.shift.deleteMany({ where: { id: { in: shiftIds } } });
                }
                await tx.zone.deleteMany({ where: { concertId } });
            }
            await tx.eventRequirement.deleteMany({ where: { concertId } });
            const jobPosts = await tx.jobPost.findMany({ where: { concertId }, select: { id: true } });
            const jobIds = jobPosts.map(j => j.id);
            if (jobIds.length > 0) {
                await tx.staffApplication.deleteMany({ where: { jobPostId: { in: jobIds } } });
                await tx.jobPost.deleteMany({ where: { id: { in: jobIds } } });
            }
            await tx.performance.deleteMany({ where: { concertId } });
            await tx.staff.updateMany({ where: { concertId }, data: { concertId: null } });
            await tx.concert.update({ where: { id: concertId }, data: { eventManagerId: null } });
            await tx.ticket.deleteMany({ where: { concertId } });
            await tx.seat.deleteMany({ where: { concertId } });
            await tx.ticketPool.deleteMany({ where: { concertId } });
            await tx.concert.delete({ where: { id: concertId } });
        });

        return { message: 'Concert đã được xóa thành công', concertId };
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

    // ─── CHECK IN TICKET ──────────────────────────────────────────
    @Post(':id/tickets/:ticketId/check-in')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Scan QR code and check in a ticket (Two-step)' })
    async checkInTicket(
        @Param('id') concertId: string,
        @Param('ticketId') ticketId: string,
        @Body() body?: { verificationToken?: string }
    ) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) {
            throw new BadRequestException('Vé không tồn tại');
        }

        if (ticket.concertId !== concertId) {
            throw new BadRequestException('Vé này không thuộc về concert hiện tại');
        }

        if (ticket.isCheckedIn) {
            throw new BadRequestException('Vé này đã được check-in trước đó');
        }

        const bookingId = ticket.bookingId;
        const sessionKey = bookingId ? `session_checkin:${bookingId}` : `session_checkin:${ticketId}`;
        const statusKey = bookingId ? `status_checkin:${bookingId}` : `status_checkin:${ticketId}`;

        // Bước 2: Xác nhận với Token
        if (body?.verificationToken) {
            const savedData = await this.redis.get<{ token: string, ticketIds: string[] }>(sessionKey);

            if (!savedData) {
                throw new BadRequestException('Phiên xác thực đã hết hạn hoặc không tồn tại (quá 5p). Hãy quét lại vé ở bước 1.');
            }

            const clientToken = String(body.verificationToken).trim().toUpperCase();
            const serverToken = String(savedData.token).trim().toUpperCase();

            // Kiểm tra mã khớp
            if (serverToken !== clientToken) {
                throw new BadRequestException(`Mã không khớp. Server chờ: ${serverToken}, Bạn gửi: ${clientToken}`);
            }

            // Kiểm tra xem chính xác ticketId này có trong session này không
            if (!savedData.ticketIds.includes(ticketId)) {
                throw new BadRequestException('Vé này không thuộc về phiên xác thực hiện tại.');
            }

            // Thực hiện check-in cho TOÀN BỘ vé trong session này
            const now = new Date();
            await this.prisma.ticket.updateMany({
                where: { id: { in: savedData.ticketIds } },
                data: {
                    isCheckedIn: true,
                    checkInTime: now
                }
            });

            // Xóa session
            await this.redis.del(sessionKey);
            await this.redis.del(statusKey);

            return {
                message: `Check-in thành công ${savedData.ticketIds.length} vé`,
                count: savedData.ticketIds.length,
                step: 2
            };
        }

        // Bước 1: Khởi tạo thử thách
        // Nếu có bookingId, tìm tất cả vé chưa check-in trong booking đó. Nếu không, chỉ xử lý chính ticketId này.
        let ticketIds = [ticketId];
        if (bookingId) {
            const pendingTickets = await this.prisma.ticket.findMany({
                where: {
                    bookingId: bookingId,
                    isCheckedIn: false,
                    concertId: concertId
                },
                select: { id: true }
            });
            if (pendingTickets.length > 0) {
                ticketIds = pendingTickets.map(t => t.id);
            }
        }

        // Bước 1: Khởi tạo thử thách
        // Kiểm tra xem đã có session nào đang chờ confirm cho booking/ticket này chưa
        const existingSession = await this.redis.get<{ token: string, ticketIds: string[] }>(sessionKey);

        let verificationToken: string;

        if (existingSession && existingSession.token) {
            // Tái sử dụng token cũ để đảm bảo đồng bộ với máy khách
            verificationToken = existingSession.token;
        } else {
            // Tạo mã xác thực mới (8 ký tự viết hoa)
            verificationToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        }

        const sessionData = {
            token: verificationToken,
            ticketIds: ticketIds
        };

        // Lưu session 5 phút (Gia hạn nếu đã có)
        await this.redis.set(sessionKey, sessionData, 300);
        await this.redis.set(statusKey, 'WAITING_CONFIRMATION', 300);

        return {
            message: 'Vui lòng quét mã QR xác thực trên máy khách hàng để hoàn tất',
            token: verificationToken,
            count: ticketIds.length,
            step: 1
        };
    }

    @Get(':id/tickets/:ticketId/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get current ticket check-in status (for polling)' })
    async getTicketStatus(
        @Param('id') concertId: string,
        @Param('ticketId') ticketId: string
    ) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) throw new BadRequestException('Vé không tồn tại');

        const bookingId = ticket.bookingId;
        const statusKey = bookingId ? `status_checkin:${bookingId}` : `status_checkin:${ticketId}`;
        const sessionKey = bookingId ? `session_checkin:${bookingId}` : `session_checkin:${ticketId}`;

        const status = await this.redis.get<string>(statusKey);
        const session = await this.redis.get<{ token: string }>(sessionKey);

        return {
            id: ticket.id,
            isCheckedIn: ticket.isCheckedIn,
            checkInTime: ticket.checkInTime,
            pendingStatus: status || 'NONE',
            verificationToken: session?.token || null
        };
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
