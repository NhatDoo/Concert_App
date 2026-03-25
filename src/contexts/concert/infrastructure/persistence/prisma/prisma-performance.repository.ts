import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IPerformanceRepository } from '../../../domain/repository/performance.repository.interface';
import { Performance } from '../../../domain/entity/performance.entity';
import { PerformanceMapper } from './performance.mapper';

@Injectable()
export class PrismaPerformanceRepository implements IPerformanceRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Performance | null> {
        const raw = await this.prisma.performance.findUnique({ where: { id } });
        if (!raw) return null;
        return PerformanceMapper.toDomain(raw);
    }

    async findByConcertId(concertId: string): Promise<Performance[]> {
        const rawList = await this.prisma.performance.findMany({
            where: { concertId },
            orderBy: { startTime: 'asc' }
        });
        return rawList.map(PerformanceMapper.toDomain);
    }

    async save(performance: Performance): Promise<void> {
        const data = PerformanceMapper.toPersistence(performance);

        await this.prisma.performance.upsert({
            where: { id: data.id },
            update: {
                concertId: data.concertId,
                artistId: data.artistId,
                name: data.name,
                durationMinutes: data.durationMinutes,
                startTime: data.startTime
            },
            create: {
                id: data.id,
                concertId: data.concertId,
                artistId: data.artistId,
                name: data.name,
                durationMinutes: data.durationMinutes,
                startTime: data.startTime
            }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.performance.delete({ where: { id } });
    }
}
