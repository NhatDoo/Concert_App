import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AssignStaffTaskCommand, UpdateStaffTaskCommand } from '../staff-task.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { StaffTask } from '../../../domain/entity/staff-task.entity';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(AssignStaffTaskCommand)
export class AssignStaffTaskHandler implements ICommandHandler<AssignStaffTaskCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
        private readonly prisma: PrismaService
    ) { }

    async execute(command: AssignStaffTaskCommand): Promise<void> {
        const { concertId, staffId, managerId, taskName, description, dueDate } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization for this concert not found');
        }

        const taskId = uuidv4();
        await this.prisma.staffTask.create({
            data: {
                id: taskId,
                taskName,
                description,
                status: 'PENDING',
                dueDate: dueDate,
                staffId: staffId,
                managerId: managerId || null
            }
        });
    }
}

@CommandHandler(UpdateStaffTaskCommand)
export class UpdateStaffTaskHandler implements ICommandHandler<UpdateStaffTaskCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
        private readonly prisma: PrismaService
    ) { }

    async execute(command: UpdateStaffTaskCommand): Promise<void> {
        const { concertId, staffId, taskId, status } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization for this concert not found');
        }

        await this.prisma.staffTask.update({
            where: { id: taskId },
            data: { status }
        });
    }
}
