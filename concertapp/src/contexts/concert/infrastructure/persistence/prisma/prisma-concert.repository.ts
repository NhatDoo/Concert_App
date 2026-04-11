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
                organizer: true,
                categories: true,
            }
        });

        return raws.map(raw => {
            const domain = ConcertMapper.toDomain(raw);
            if (!domain) return null;

            // Đính kèm thêm thông tin mở rộng (Metadata) vào object trả về
            const minPrice = raw.ticketPools.length > 0 ? Math.min(...raw.ticketPools.map((tp: any) => tp.price)) : 0;

            return {
                id: domain.getId(),
                title: domain.getName(), // Frontend expects 'title'
                name: domain.getName(),  // For internal/Elasticsearch compatibility
                location: domain.getLocation(),
                dateStr: new Date(domain.getDate().getValue()).toLocaleDateString('vi-VN'), // Frontend expects 'dateStr'
                startDate: domain.getDate().getValue(), // For internal/Elasticsearch compatibility
                imageUrl: domain.getImageUrl() || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a',
                organizer: raw.organizer.name,
                organizerName: raw.organizer.name, // For compatibility
                priceStr: minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} VND` : 'Liên hệ',
                minPrice: minPrice, // For compatibility
                category: raw.categories.length > 0 ? raw.categories[0].name : 'Nhạc Sống',
                hashtags: domain.getHashtags(),
                categoryIds: domain.getCategoryIds(),
                organizerId: domain.getOrganizerId(),
                artists: raw.performances.map((p: any) => p.artist.name), // For compatibility
            };
        }).filter(c => c !== null);
    }

    async findById(id: string): Promise<Concert | null> {
        const raw = await this.prisma.concert.findUnique({
            where: { id: id },
            include: {
                categories: true
            }
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
                hashtags: persistence.hashtags,
                categories: {
                    set: persistence.categoryIds.map(slug => ({ slug }))
                }
            },
            create: {
                id: persistence.id,
                organizerId: persistence.organizerId,
                name: persistence.name,
                startDate: persistence.startDate,
                location: persistence.location,
                imageUrl: persistence.imageUrl,
                hashtags: persistence.hashtags,
                categories: {
                    connect: persistence.categoryIds.map(slug => ({ slug }))
                }
            }
        });
    }
}
