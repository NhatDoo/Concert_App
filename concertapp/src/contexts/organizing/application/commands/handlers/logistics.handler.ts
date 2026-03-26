import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AddLogisticsTaskCommand, UpdateLogisticsStatusCommand } from '../logistics.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { Logistics } from '../../../domain/entity/logistics.entity';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';

@CommandHandler(AddLogisticsTaskCommand)
export class AddLogisticsTaskHandler implements ICommandHandler<AddLogisticsTaskCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: AddLogisticsTaskCommand): Promise<void> {
        const { concertId, taskName, vendor, cost } = command;

        let organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            organize = OrganizeAggregate.create(uuidv4(), concertId);
        }

        const taskId = uuidv4();
        const task = Logistics.create(taskId, taskName, vendor, cost);
        organize.addLogisticsTask(task);

        await this.repository.save(organize);
    }
}

@CommandHandler(UpdateLogisticsStatusCommand)
export class UpdateLogisticsStatusHandler implements ICommandHandler<UpdateLogisticsStatusCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: UpdateLogisticsStatusCommand): Promise<void> {
        const { concertId, taskId, status } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization for this concert not found');
        }

        organize.updateLogisticsStatus(taskId, status);

        await this.repository.save(organize);
    }
}
