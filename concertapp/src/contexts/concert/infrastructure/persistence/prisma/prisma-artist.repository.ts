import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IArtistRepository } from '../../../domain/repository/artist.repository.interface';
import { Artist } from '../../../domain/entity/artist.entity';
import { ArtistMapper } from './artist.mapper';

@Injectable()
export class PrismaArtistRepository implements IArtistRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Artist | null> {
        const raw = await this.prisma.artist.findUnique({ where: { id } });
        if (!raw) return null;
        return ArtistMapper.toDomain(raw);
    }

    async findAll(): Promise<Artist[]> {
        const rawList = await this.prisma.artist.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return rawList.map(ArtistMapper.toDomain);
    }

    async save(artist: Artist): Promise<void> {
        const data = ArtistMapper.toPersistence(artist);

        await this.prisma.artist.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                bio: data.bio,
                contactInfo: data.contactInfo
            },
            create: {
                id: data.id,
                name: data.name,
                bio: data.bio,
                contactInfo: data.contactInfo
            }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.artist.delete({ where: { id } });
    }
}
