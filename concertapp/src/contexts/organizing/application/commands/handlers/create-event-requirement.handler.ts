import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateEventRequirementCommand } from '../create-event-requirement.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';
import { EventRequirement } from '../../../domain/entity/event-requirement.entity';

@CommandHandler(CreateEventRequirementCommand)
export class CreateEventRequirementHandler implements ICommandHandler<CreateEventRequirementCommand, string> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: CreateEventRequirementCommand): Promise<string> {
        const { concertId, authorId, title, description, staffNeeded, budgetAllocated, vendorId } = command;

        let organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            // Tự động khởi tạo context Tổ chức nếu chưa tồn tại
            const orgId = uuidv4();
            organize = OrganizeAggregate.create(orgId, concertId);
        }

        const requirementId = uuidv4();
        const requirement = EventRequirement.create(
            requirementId,
            title,
            description,
            authorId,
            vendorId,
            staffNeeded,
            budgetAllocated
        );

        organize.addRequirement(requirement);

        await this.repository.save(organize);

        return requirementId;
    }
}
