import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateConcertCommand } from '../create-concert.command';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { ISTORAGE_SERVICE } from '../../../domain/service/storage.service.interface';
import type { IStorageService } from '../../../domain/service/storage.service.interface';
import { Concert } from '../../../domain/entity/concert.entity';
import { StartDate } from '../../../domain/VO/startdate.vo';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { PrismaService } from '../../../../../prisma.service';

const IMAGE_BUCKET = 'images';

@CommandHandler(CreateConcertCommand)
export class CreateConcertHandler implements ICommandHandler<CreateConcertCommand, string> {
    constructor(
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepository: IConcertRepository,
        @Inject(ISTORAGE_SERVICE) private readonly storageService: IStorageService,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: CreateConcertCommand): Promise<string> {
        const { organizerId, name, startDate, location, imageFile, seatMapFile, seats, categories, hashtags } = command;

        // Xử lý tạo Value Object StartDate (sẽ check validation ngày)
        const startDateVO = StartDate.create(startDate);

        // 1. Tạo Concert CHƯA có image → lưu DB trước
        const newConcertId = uuidv4();
        const concert = this.publisher.mergeObjectContext(
            Concert.create(
                newConcertId,
                organizerId,
                name,
                startDateVO,
                location,
                null,
                null,
                hashtags || [],
                categories || [],
            )
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

        // 4. Clear Cache trang chủ để đảm bảo dữ liệu mới được fetch ngay
        if (seatMapFile) {
            const fileExtension = seatMapFile.originalname.split('.').pop();
            const objectName = `concert-seat-maps/${newConcertId}.${fileExtension}`;
            const seatMapUrl = await this.storageService.uploadFile(
                IMAGE_BUCKET,
                objectName,
                seatMapFile.buffer,
                seatMapFile.mimetype,
            );

            concert.updateSeatMapUrl(seatMapUrl);
            await this.concertRepository.save(concert);
        }

        if (seats && seats.length > 0) {
            await this.prisma.$transaction(async (tx) => {
                await tx.seat.createMany({
                    data: seats.map((seat) => ({
                        concertId: newConcertId,
                        label: seat.label,
                        ticketType: seat.ticketType,
                        price: seat.price,
                        status: 'AVAILABLE',
                    })),
                });

                const groupedPools = new Map<string, { price: number; totalQuantity: number }>();

                for (const seat of seats) {
                    const current = groupedPools.get(seat.ticketType);
                    if (current) {
                        current.totalQuantity += 1;
                        current.price = Math.min(current.price, seat.price);
                    } else {
                        groupedPools.set(seat.ticketType, {
                            price: seat.price,
                            totalQuantity: 1,
                        });
                    }
                }

                for (const [ticketType, pool] of groupedPools.entries()) {
                    await tx.ticketPool.upsert({
                        where: {
                            concertId_ticketType: {
                                concertId: newConcertId,
                                ticketType,
                            },
                        },
                        update: {
                            price: pool.price,
                            totalQuantity: pool.totalQuantity,
                        },
                        create: {
                            concertId: newConcertId,
                            ticketType,
                            price: pool.price,
                            totalQuantity: pool.totalQuantity,
                            soldCount: 0,
                        },
                    });
                }
            });
        }

        try {
            await this.redisService.del('concerts:all:v2');
        } catch (e) {
            console.warn('[Cache] Error clearing home page cache:', e.message);
        }

        // 4. Commit all events (including ConcertCreatedEvent)
        concert.commit();

        return newConcertId;
    }
}
