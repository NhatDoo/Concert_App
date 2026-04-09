import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AssignStaffToShiftCommand } from '../assign-staff-shift.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { ShiftAssignment } from '../../../domain/entity/shift-assignment.entity';

@CommandHandler(AssignStaffToShiftCommand)
export class AssignStaffToShiftHandler implements ICommandHandler<AssignStaffToShiftCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: AssignStaffToShiftCommand): Promise<void> {
        const { concertId, shiftId, staffId } = command;

        const organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            throw new NotFoundException('Organization context not found');
        }

        // Find the shift in any of the zones
        let shiftDoc: any = null;
        for (const zone of organize.getZones()) {
            const found = zone.getShifts().find(s => s.id === shiftId);
            if (found) {
                shiftDoc = found;
                break;
            }
        }

        if (!shiftDoc) {
            throw new NotFoundException('Shift not found in this organization');
        }

        const assignmentId = uuidv4();
        const assignment = ShiftAssignment.create(assignmentId, shiftId, staffId);

        shiftDoc.assignStaff(assignment);

        await this.repository.save(organize);
    }
}
