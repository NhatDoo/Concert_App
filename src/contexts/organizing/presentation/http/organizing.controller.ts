import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssignLocationCommand } from '../../application/commands/assign-location.command';
import { AddLogisticsTaskCommand, UpdateLogisticsStatusCommand } from '../../application/commands/logistics.command';
import { AddEquipmentCommand, AddStaffCommand } from '../../application/commands/equipment-staff.command';
import { AssignLocationDto } from './dto/assign-location.dto';
import { AddLogisticsDto, UpdateLogisticsStatusDto, AddEquipmentDto, AddStaffDto } from './dto/management.dto';
import { AssignStaffTaskDto, UpdateStaffTaskDto } from './dto/staff-task.dto';
import { LogisticsStatus } from '../../domain/entity/logistics.entity';
import { StaffTaskStatus } from '../../domain/entity/staff-task.entity';
import { AssignStaffTaskCommand, UpdateStaffTaskCommand } from '../../application/commands/staff-task.command';

@ApiTags('Organizing')
@Controller('organize')
export class OrganizingController {
    constructor(private readonly commandBus: CommandBus) { }

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
        @Body() dto: UpdateLogisticsStatusDto
    ) {
        const command = new UpdateLogisticsStatusCommand(concertId, taskId, dto.status as LogisticsStatus);
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

    @Post(':concertId/staff')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add staff member to the concert organization' })
    async addStaff(@Param('concertId') concertId: string, @Body() dto: AddStaffDto) {
        const command = new AddStaffCommand(concertId, dto.userId, dto.name, dto.role);
        await this.commandBus.execute(command);
        return { message: 'Staff member added' };
    }

    @Post(':concertId/staff/:staffId/tasks')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Assign a task to a specific staff member' })
    async assignTaskToStaff(
        @Param('concertId') concertId: string,
        @Param('staffId') staffId: string,
        @Body() dto: AssignStaffTaskDto
    ) {
        const command = new AssignStaffTaskCommand(concertId, staffId, dto.description);
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
