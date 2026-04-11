import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateConcertCommand } from '../update-concert.command';
import { Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { ISTORAGE_SERVICE } from '../../../domain/service/storage.service.interface';
import type { IStorageService } from '../../../domain/service/storage.service.interface';
import { StartDate } from '../../../domain/VO/startdate.vo';
import { RedisService } from '../../../infrastructure/redis/redis.service';

const IMAGE_BUCKET = 'images';

@CommandHandler(UpdateConcertCommand)
export class UpdateConcertHandler implements ICommandHandler<UpdateConcertCommand> {
    private readonly logger = new Logger(UpdateConcertHandler.name);

    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly repository: IConcertRepository,
        @Inject(ISTORAGE_SERVICE) private readonly storageService: IStorageService,
        private readonly redisService: RedisService,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: UpdateConcertCommand): Promise<void> {
        const { concertId, organizerId, name, startDate, location, imageFile, categories, hashtags } = command;

        const concert = await this.repository.findById(concertId);
        if (!concert) {
            throw new NotFoundException('Concert not found');
        }

        // Verify ownership
        if (concert.getOrganizerId() !== organizerId) {
            throw new ForbiddenException('You do not have permission to update this concert');
        }

        const concertModel = this.publisher.mergeObjectContext(concert);

        // Update basic info
        if (name) concertModel.rename(name);
        if (startDate) concertModel.reschedule(StartDate.create(startDate));
        if (location) concertModel.changeLocation(location);

        // Update tags & categories
        if (categories !== undefined || hashtags !== undefined) {
            const finalHashtags = hashtags !== undefined ? hashtags : concertModel.getHashtags();
            const finalCategories = categories !== undefined ? categories : concertModel.getCategoryIds();
            concertModel.setMetadata(finalHashtags, finalCategories);
        }

        // Update image if provided
        if (imageFile) {
            const fileExtension = imageFile.originalname.split('.').pop();
            const objectName = `concerts/${concertId}.${fileExtension}`;
            const imageUrl = await this.storageService.uploadFile(
                IMAGE_BUCKET,
                objectName,
                imageFile.buffer,
                imageFile.mimetype,
            );
            concertModel.updateImageUrl(imageUrl);
        }

        await this.repository.save(concertModel);

        // Clear Cache
        try {
            await this.redisService.del('concerts:all:v2');
            await this.redisService.del(`concert:${concertId}:v2`);
        } catch (e) {
            this.logger.warn(`[Cache] Error clearing cache for updated concert: ${e.message}`);
        }

        concertModel.commit();
    }
}
