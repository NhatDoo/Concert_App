import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { BulkAddStaffCommand } from '../bulk-add-staff.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { Staff } from '../../../domain/entity/staff.entity';
import { StaffRole } from '../../../domain/VO/staff.role';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';

@CommandHandler(BulkAddStaffCommand)
export class BulkAddStaffHandler implements ICommandHandler<BulkAddStaffCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: BulkAddStaffCommand): Promise<void> {
        const { concertId, staffMembers } = command;

        let organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            organize = OrganizeAggregate.create(uuidv4(), concertId);
        }

        for (const member of staffMembers) {
            const staffId = uuidv4();
            const staff = Staff.create(
                staffId,
                member.userId,
                member.name,
                StaffRole.create(member.role || 'Staff'),
                concertId
            );
            organize.addStaff(staff);
        }

        await this.repository.save(organize);
    }
}
