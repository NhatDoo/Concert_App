import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { Concert } from '../../../domain/entity/concert.entity';
import { ConcertMapper } from './concert.mapper';

@Injectable()
export class PrismaConcertRepository implements IConcertRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Concert | null> {
        const raw = await this.prisma.concert.findUnique({
            where: { id: id }
        });

        if (!raw) return null;

        return ConcertMapper.toDomain(raw);
    }

    async save(concert: Concert): Promise<void> {
        const persistence = ConcertMapper.toPersistence(concert);

        await this.prisma.concert.upsert({
            where: { id: persistence.id },
            update: {
                name: persistence.name,
                startDate: persistence.startDate,
                location: persistence.location,
                imageUrl: persistence.imageUrl,
            },
            create: {
                id: persistence.id,
                organizerId: persistence.organizerId,
                name: persistence.name,
                startDate: persistence.startDate,
                location: persistence.location,
                imageUrl: persistence.imageUrl,
            }
        });
    }
}
