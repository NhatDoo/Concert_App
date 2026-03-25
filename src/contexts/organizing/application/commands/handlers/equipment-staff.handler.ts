import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AddEquipmentCommand, AddStaffCommand } from '../equipment-staff.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { Divide } from '../../../domain/entity/devide.entity';
import { DetailDivide } from '../../../domain/entity/detail_devide';
import { Staff } from '../../../domain/entity/staff.entity';
import { StaffRole } from '../../../domain/VO/staff.role';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';

@CommandHandler(AddEquipmentCommand)
export class AddEquipmentHandler implements ICommandHandler<AddEquipmentCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: AddEquipmentCommand): Promise<void> {
        const { concertId, equipmentName, details } = command;

        let organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            organize = OrganizeAggregate.create(uuidv4(), concertId);
        }

        const equipId = uuidv4();
        const detailEntities = details.map((d, index) => DetailDivide.create(index + 1, d, equipId));
        const equipment = Divide.create(equipId, equipmentName, detailEntities);

        organize.addEquipment(equipment);
        await this.repository.save(organize);
    }
}

@CommandHandler(AddStaffCommand)
export class AddStaffHandler implements ICommandHandler<AddStaffCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly repository: IOrganizeRepository,
    ) { }

    async execute(command: AddStaffCommand): Promise<void> {
        const { concertId, userId, name, role } = command;

        let organize = await this.repository.findByConcertId(concertId);
        if (!organize) {
            organize = OrganizeAggregate.create(uuidv4(), concertId);
        }

        const staffId = uuidv4();
        const staff = Staff.create(staffId, userId, name, StaffRole.create(role), concertId);

        organize.addStaff(staff);
        await this.repository.save(organize);
    }
}
