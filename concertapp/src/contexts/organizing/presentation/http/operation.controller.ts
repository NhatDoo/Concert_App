import { Controller, Post, Body, HttpCode, HttpStatus, Param, Get, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { GetOrganizerStatsQuery } from '../../application/queries/get-organizer-stats.query';
import { GetRequirementsQuery } from '../../application/queries/get-requirements.query';
import { CreateEventRequirementCommand } from '../../application/commands/create-event-requirement.command';
import { CreateZoneCommand } from '../../application/commands/create-zone.command';
import { CreateShiftCommand } from '../../application/commands/create-shift.command';
import { AssignStaffToShiftCommand } from '../../application/commands/assign-staff-shift.command';
import { PrismaService } from '../../../../prisma.service';
import { CreateEventRequirementDto, CreateZoneDto, CreateShiftDto, AssignShiftDto } from './dto/operation.dto';

@ApiTags('Organizing Operations')
@Controller('organize')
export class OperationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService
    ) { }

    @Get('requirements')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách yêu cầu vận hành với bộ lọc' })
    async getRequirements(
        @Query('concertId') concertId?: string,
        @Query('vendorId') vendorId?: string,
        @Query('status') status?: string
    ) {
        return await this.queryBus.execute(new GetRequirementsQuery({ concertId, vendorId, status }));
    }

    @Post('requirements')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo yêu cầu vận hành mới' })
    async createRequirement(@Body() dto: CreateEventRequirementDto) {
        // 1. Resolve author (User -> Staff)
        let staffAuthor = await this.prisma.staff.findFirst({
            where: { userId: dto.authorId }
        });

        if (!staffAuthor) {
            const user = await this.prisma.user.findUnique({ where: { id: dto.authorId } });
            staffAuthor = await this.prisma.staff.create({
                data: {
                    id: uuidv4(),
                    userId: dto.authorId,
                    name: user?.name || 'Organizer',
                    role: 'ORGANIZER'
                }
            });
        }

        // 2. Resolve vendorId (could be Staff ID or User ID, but needs to be Vendor ID)
        let resolvedVendorId = dto.vendorId;
        if (dto.vendorId) {
            // Check if it's already a valid Vendor ID
            const isVendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });

            if (!isVendor) {
                // If not, maybe it's a Staff ID
                const staffVendor = await this.prisma.staff.findUnique({
                    where: { id: dto.vendorId },
                    include: { user: { include: { vendor: true } } }
                });

                if (staffVendor) {
                    if (staffVendor.user.vendor) {
                        resolvedVendorId = staffVendor.user.vendor.id;
                    } else {
                        // Create a vendor profile for this user if missing
                        const newVendor = await this.prisma.vendor.create({
                            data: {
                                id: uuidv4(),
                                userId: staffVendor.userId,
                                companyName: staffVendor.name
                            }
                        });
                        resolvedVendorId = newVendor.id;
                    }
                }
            }
        }

        const command = new CreateEventRequirementCommand(
            dto.concertId,
            staffAuthor.id,
            dto.title,
            dto.description || null,
            dto.staffNeeded,
            dto.equipmentNeeded || 0,
            dto.budgetAllocated,
            resolvedVendorId || null
        );
        const result = await this.commandBus.execute(command);
        return { id: result, message: 'Yêu cầu vận hành đã được tạo' };
    }

    @Post('zones')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create zone' })
    async createZone(@Body() dto: CreateZoneDto) {
        const command = new CreateZoneCommand(dto.concertId, dto.name, dto.description, dto.capacity);
        const id = await this.commandBus.execute(command);
        return { id, message: 'Khu vực vận hành đã được lập' };
    }

    @Post('shifts')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new shift within a zone' })
    async createShift(@Body() dto: CreateShiftDto) {
        const command = new CreateShiftCommand(
            dto.concertId,
            dto.zoneId,
            dto.title,
            dto.description || null,
            new Date(dto.startTime),
            new Date(dto.endTime),
            dto.headcount,
            dto.managerId || null
        );
        const id = await this.commandBus.execute(command);
        return { id, message: 'Ca làm việc đã được khởi tạo' };
    }

    @Post('shifts/assign')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign a staff member to a shift' })
    async assignToShift(@Body() dto: AssignShiftDto, @Query('concertId') concertId: string) {
        if (!concertId) throw new Error('concertId query param is required');
        const command = new AssignStaffToShiftCommand(concertId, dto.shiftId, dto.staffId);
        await this.commandBus.execute(command);
        return { message: 'Nhân sự đã được gán vào ca làm việc thành công' };
    }

    @Post('reports')
    @Roles('EVENT_MANAGER', 'MANAGER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Submit event report' })
    async submitReport(@Body() dto: any) {
        return this.prisma.eventReport.create({
            data: {
                organizerId: dto.organizerId,
                authorId: dto.authorId,
                concertId: dto.concertId,
                concertName: dto.concertName,
                budgetAudit: parseFloat(dto.budgetAudit) || 0,
                marketingReach: parseInt(dto.marketingReach) || 0,
                staffEvaluation: dto.staffEvaluation,
                finalStatus: dto.finalStatus || 'SUCCESS',
                notes: dto.notes
            }
        });
    }

    @Get('reports/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get reports' })
    async getReports(@Param('organizerId') organizerId: string) {
        return this.prisma.eventReport.findMany({
            where: { organizerId },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Get('stats/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get dashboard stats for an organizer' })
    async getStats(@Param('organizerId') organizerId: string) {
        return this.queryBus.execute(new GetOrganizerStatsQuery(organizerId));
    }
}
