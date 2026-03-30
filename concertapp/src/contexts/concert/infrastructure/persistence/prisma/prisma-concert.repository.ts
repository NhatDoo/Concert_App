import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IConcertRepository } from '../../../domain/repository/concert.repository.interface';
import { Concert } from '../../../domain/entity/concert.entity';
import { ConcertMapper } from './concert.mapper';

@Injectable()
export class PrismaConcertRepository implements IConcertRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<any[]> {
        const raws = await this.prisma.concert.findMany({
            include: {
                ticketPools: true,
                performances: {
                    include: {
                        artist: true
                    }
                },
                organizer: true
            }
        });

        return raws.map(raw => {
            const domain = ConcertMapper.toDomain(raw);
            if (!domain) return null;

            // Đính kèm thêm thông tin mở rộng (Metadata) vào object trả về
            return {
                ...domain,
                id: domain.getId(),
                name: domain.getName(),
                location: domain.getLocation(),
                startDate: domain.getDate().getValue(),
                imageUrl: domain.getImageUrl(),
                artists: raw.performances.map((p: any) => p.artist.name),
                organizerName: raw.organizer.name,
                minPrice: raw.ticketPools.length > 0 ? Math.min(...raw.ticketPools.map((tp: any) => tp.price)) : 0,
                category: "Music" // Hardcode mặc định cho bản concert này
            };
        }).filter(c => c !== null);
    }

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
