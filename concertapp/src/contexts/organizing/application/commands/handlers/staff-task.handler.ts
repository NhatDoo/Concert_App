import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AssignStaffTaskCommand, UpdateStaffTaskCommand } from '../staff-task.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { StaffTask } from '../../../domain/entity/staff-task.entity';

@CommandHandler(AssignStaffTaskCommand)
export class AssignStaffTaskHandler implements ICommandHandler<AssignStaffTaskCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: AssignStaffTaskCommand): Promise<void> {
        const { concertId, staffId, description } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization for this concert not found');
        }

        const taskId = uuidv4();
        const task = StaffTask.create(taskId, description, staffId);
        organize.assignTaskToStaff(staffId, task);

        await this.repository.save(organize);
    }
}

@CommandHandler(UpdateStaffTaskCommand)
export class UpdateStaffTaskHandler implements ICommandHandler<UpdateStaffTaskCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: UpdateStaffTaskCommand): Promise<void> {
        const { concertId, staffId, taskId, status } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization for this concert not found');
        }

        organize.updateStaffTaskStatus(staffId, taskId, status);

        await this.repository.save(organize);
    }
}
