import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AddPerformanceCommand, UpdatePerformanceScheduleCommand } from '../performance.command';
import { IPERFORMANCE_REPOSITORY } from '../../../domain/repository/performance.repository.interface';
import type { IPerformanceRepository } from '../../../domain/repository/performance.repository.interface';
import { IARTIST_REPOSITORY } from '../../../domain/repository/artist.repository.interface';
import type { IArtistRepository } from '../../../domain/repository/artist.repository.interface';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { Performance } from '../../../domain/entity/performance.entity';

@CommandHandler(AddPerformanceCommand)
export class AddPerformanceHandler implements ICommandHandler<AddPerformanceCommand, string> {
    constructor(
        @Inject(IPERFORMANCE_REPOSITORY) private readonly performanceRepo: IPerformanceRepository,
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepo: IConcertRepository,
        @Inject(IARTIST_REPOSITORY) private readonly artistRepo: IArtistRepository,
    ) { }

    async execute(command: AddPerformanceCommand): Promise<string> {
        const { concertId, artistId, name, durationMinutes, startTime } = command;

        // Validate concert exists
        const concert = await this.concertRepo.findById(concertId);
        if (!concert) throw new NotFoundException('Concert not found');

        // Validate artist exists
        const artist = await this.artistRepo.findById(artistId);
        if (!artist) throw new NotFoundException('Artist not found');

        const id = uuidv4();
        const performance = Performance.create(id, concertId, artistId, name, durationMinutes, new Date(startTime));

        await this.performanceRepo.save(performance);
        return id;
    }
}

@CommandHandler(UpdatePerformanceScheduleCommand)
export class UpdatePerformanceScheduleHandler implements ICommandHandler<UpdatePerformanceScheduleCommand, void> {
    constructor(
        @Inject(IPERFORMANCE_REPOSITORY) private readonly performanceRepo: IPerformanceRepository,
    ) { }

    async execute(command: UpdatePerformanceScheduleCommand): Promise<void> {
        const { performanceId, startTime, durationMinutes } = command;

        const performance = await this.performanceRepo.findById(performanceId);
        if (!performance) throw new NotFoundException('Performance not found');

        performance.updateSchedule(new Date(startTime), durationMinutes);
        await this.performanceRepo.save(performance);
    }
}
