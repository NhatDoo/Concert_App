import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateShiftCommand } from '../create-shift.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { Shift } from '../../../domain/entity/shift.entity';

@CommandHandler(CreateShiftCommand)
export class CreateShiftHandler implements ICommandHandler<CreateShiftCommand, string> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: CreateShiftCommand): Promise<string> {
        const { concertId, zoneId, title, description, startTime, endTime, headcount, managerId } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization context not found');
        }

        const shiftId = uuidv4();
        const shift = Shift.create(
            shiftId,
            managerId,
            title,
            description,
            startTime,
            endTime,
            headcount
        );

        organize.addShiftToZone(zoneId, shift);

        await this.repository.save(organize);

        return shiftId;
    }
}
