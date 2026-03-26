import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateConcertCommand } from '../create-concert.command';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { ISTORAGE_SERVICE } from '../../../domain/service/storage.service.interface';
import type { IStorageService } from '../../../domain/service/storage.service.interface';
import { Concert } from '../../../domain/entity/concert.entity';
import { StartDate } from '../../../domain/VO/startdate.vo';

const IMAGE_BUCKET = 'images';

@CommandHandler(CreateConcertCommand)
export class CreateConcertHandler implements ICommandHandler<CreateConcertCommand, string> {
    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepository: IConcertRepository,
        @Inject(ISTORAGE_SERVICE) private readonly storageService: IStorageService,
    ) { }

    async execute(command: CreateConcertCommand): Promise<string> {
        const { organizerId, name, startDate, location, imageFile } = command;

        // Xử lý tạo Value Object StartDate (sẽ check validation ngày)
        const startDateVO = StartDate.create(startDate);

        // 1. Tạo Concert CHƯA có image → lưu DB trước
        const newConcertId = uuidv4();
        const concert = Concert.create(
            newConcertId,
            organizerId,
            name,
            startDateVO,
            location,
        );

        await this.concertRepository.save(concert);

        // 2. Upload image lên MinIO SAU KHI concert đã lưu DB thành công
        if (imageFile) {
            const fileExtension = imageFile.originalname.split('.').pop();
            const objectName = `concerts/${newConcertId}.${fileExtension}`;
            const imageUrl = await this.storageService.uploadFile(
                IMAGE_BUCKET,
                objectName,
                imageFile.buffer,
                imageFile.mimetype,
            );

            // 3. Cập nhật imageUrl vào concert
            concert.updateImageUrl(imageUrl);
            await this.concertRepository.save(concert);
        }

        return newConcertId;
    }
}
