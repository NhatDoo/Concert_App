import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateZoneCommand } from '../create-zone.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { Zone } from '../../../domain/entity/zone.entity';

@CommandHandler(CreateZoneCommand)
export class CreateZoneHandler implements ICommandHandler<CreateZoneCommand, string> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: CreateZoneCommand): Promise<string> {
        const { concertId, name, description, capacity } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization context not found');
        }

        const zoneId = uuidv4();
        const zone = Zone.create(zoneId, name, description, capacity);

        organize.addZone(zone);

        await this.repository.save(organize);

        return zoneId;
    }
}
