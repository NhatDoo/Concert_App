import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateConcertCommand } from '../create-concert.command';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { Concert } from '../../../domain/entity/concert.entity';
import { StartDate } from '../../../domain/VO/startdate.vo';

@CommandHandler(CreateConcertCommand)
export class CreateConcertHandler implements ICommandHandler<CreateConcertCommand, string> {
    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepository: IConcertRepository,
    ) { }

    async execute(command: CreateConcertCommand): Promise<string> {
        const { organizerId, name, startDate, location } = command;

        // Xử lý tạo Value Object StartDate (sẽ check validation ngày)
        const startDateVO = StartDate.create(startDate);

        // Tạo Entity Root: Concert
        const newConcertId = uuidv4();
        const concert = Concert.create(
            newConcertId,
            organizerId,
            name,
            startDateVO,
            location
        );

        // Lưu xuống Database
        await this.concertRepository.save(concert);

        // Trả về ID của Concert mới được tạo
        return newConcertId;
    }
}
