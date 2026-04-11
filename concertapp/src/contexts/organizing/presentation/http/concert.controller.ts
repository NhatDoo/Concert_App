import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AssignLocationCommand } from '../../application/commands/assign-location.command';
import { AddLogisticsTaskCommand, UpdateLogisticsStatusCommand } from '../../application/commands/logistics.command';
import { AddEquipmentCommand, AddStaffCommand } from '../../application/commands/equipment-staff.command';
import { AssignStaffTaskCommand, UpdateStaffTaskCommand } from '../../application/commands/staff-task.command';
import { BulkAddStaffCommand } from '../../application/commands/bulk-add-staff.command';
import { GetConcertStaffQuery } from '../../application/queries/get-concert-staff.query';
import { PrismaService } from '../../../../prisma.service';

import { AssignLocationDto } from './dto/assign-location.dto';
import { AddLogisticsDto, AddEquipmentDto, AddStaffDto } from './dto/management.dto';
import { AssignStaffTaskDto, UpdateStaffTaskDto } from './dto/staff-task.dto';
import { StaffTaskStatus } from '../../domain/entity/staff-task.entity';

@ApiTags('Organizing Concerts')
@Controller('organize')
export class ConcertController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService
    ) { }

    @Get(':organizerId/vendors')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách các đối tác (Vendor Staff) thuộc Organizer' })
    async getVendors(@Param('organizerId') organizerId: string) {
        return await this.prisma.staff.findMany({
            where: {
                OR: [
                    { role: 'VENDOR' },
                    { user: { role: 'VENDOR' } }
                ]
            },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { name: 'asc' }
        });
    }

    @Get(':concertId/staff')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all staff workers assigned to the concert' })
    async getStaff(@Param('concertId') concertId: string) {
        return this.queryBus.execute(new GetConcertStaffQuery(concertId));
    }

    @Post('location')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign a location to a corresponding concert organization' })
    @ApiResponse({ status: 200, description: 'Location successfully assigned and synched' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid UUID)' })
    async assignLocation(@Body() dto: AssignLocationDto): Promise<{ message: string }> {
        const command = new AssignLocationCommand(
            dto.concertId,
            dto.locationName,
            dto.address,
            dto.capacity
        );

        await this.commandBus.execute(command);

        return {
            message: 'Location successfully assigned to Concert logic.'
        };
    }

    @Post(':concertId/logistics')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a logistics task to the concert' })
    async addLogistics(@Param('concertId') concertId: string, @Body() dto: AddLogisticsDto) {
        const command = new AddLogisticsTaskCommand(concertId, dto.taskName, dto.vendor, dto.cost);
        await this.commandBus.execute(command);
        return { message: 'Logistics task added' };
    }

    @Patch(':concertId/logistics/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update status of a logistics task' })
    async updateLogisticsStatus(
        @Param('concertId') concertId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateStaffTaskDto // Shared status DTO
    ) {
        const command = new UpdateLogisticsStatusCommand(concertId, taskId, dto.status as any);
        await this.commandBus.execute(command);
        return { message: 'Logistics status updated' };
    }

    @Post(':concertId/equipments')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add equipment to the concert' })
    async addEquipment(@Param('concertId') concertId: string, @Body() dto: AddEquipmentDto) {
        const command = new AddEquipmentCommand(concertId, dto.name, dto.details);
        await this.commandBus.execute(command);
        return { message: 'Equipment added' };
    }

    @Patch(':concertId/staff/:staffId/assign')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign an existing staff member to the concert' })
    async assignStaffToConcert(@Param('concertId') concertId: string, @Param('staffId') staffId: string) {
        await this.prisma.staff.update({
            where: { id: staffId },
            data: { concertId }
        });
        return { message: 'Staff member assigned to concert' };
    }

    @Patch(':concertId/staff/:staffId/unassign')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a staff member from the concert' })
    async unassignStaffFromConcert(@Param('concertId') concertId: string, @Param('staffId') staffId: string) {
        await this.prisma.staff.update({
            where: { id: staffId },
            data: { concertId: null }
        });
        return { message: 'Staff member removed from concert' };
    }

    @Post(':concertId/staff/bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk add staff members to the concert' })
    async bulkAddStaff(
        @Param('concertId') concertId: string,
        @Body() body: { staffMembers: Array<{ userId: string, name: string, role: string }> }
    ) {
        const command = new BulkAddStaffCommand(concertId, body.staffMembers);
        await this.commandBus.execute(command);
        return { message: `${body.staffMembers.length} staff members added` };
    }

    @Post(':concertId/staff/:staffId/tasks')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Assign a task to a specific staff member' })
    async assignTaskToStaff(
        @Param('concertId') concertId: string,
        @Param('staffId') staffId: string,
        @Body() dto: AssignStaffTaskDto
    ) {
        const command = new AssignStaffTaskCommand(
            concertId,
            staffId,
            dto.managerId,
            dto.taskName,
            dto.description,
            new Date(dto.dueDate)
        );
        await this.commandBus.execute(command);
        return { message: 'Task successfully assigned to staff member' };
    }

    @Patch(':concertId/staff/:staffId/tasks/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update the status of a staff task' })
    async updateStaffTaskStatus(
        @Param('concertId') concertId: string,
        @Param('staffId') staffId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateStaffTaskDto
    ) {
        const command = new UpdateStaffTaskCommand(concertId, staffId, taskId, dto.status as StaffTaskStatus);
        await this.commandBus.execute(command);
        return { message: 'Staff task status updated' };
    }
}
