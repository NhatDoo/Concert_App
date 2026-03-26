import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AssignLocationCommand } from '../assign-location.command';
import { IORGANIZE_REPOSITORY } from '../../../domain/repository/organize.repository.interface';
import type { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';
import { Location } from '../../../domain/entity/location.entity';

@CommandHandler(AssignLocationCommand)
export class AssignLocationHandler implements ICommandHandler<AssignLocationCommand, void> {
    constructor(
        @Inject(IORGANIZE_REPOSITORY) private readonly organizeRepository: IOrganizeRepository,
    ) { }

    async execute(command: AssignLocationCommand): Promise<void> {
        const { concertId, locationName, address, capacity } = command;

        // 1. Lấy thông tin Context tổ chức dựa theo ID của Sự kiện
        let organize = await this.organizeRepository.findByConcertId(concertId);

        // * Giả sử nếu chưa từng có hồ sơ Organizing cho Concert này, thì ta tạo mới aggregate Root luôn
        if (!organize) {
            const orgId = uuidv4();
            organize = OrganizeAggregate.create(orgId, concertId);
        }

        // 2. Wrap dữ liệu Location
        const locationId = uuidv4();
        const locationVO = Location.create(locationId, locationName, address, capacity);

        // 3. Domain Logic: Gán địa điểm
        organize.assignLocation(locationVO);

        // 4. Lưu Aggregate khổng lồ này về DB thông qua Repository (upsert transaction)
        await this.organizeRepository.save(organize);
    }
}
