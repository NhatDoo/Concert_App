import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../prisma.service';
import { ICONCERT_REPOSITORY } from '../domain/repository/concert.repository.interface';
import { PrismaConcertRepository } from './persistence/prisma/prisma-concert.repository';
import { IARTIST_REPOSITORY } from '../domain/repository/artist.repository.interface';
import { PrismaArtistRepository } from './persistence/prisma/prisma-artist.repository';
import { IPERFORMANCE_REPOSITORY } from '../domain/repository/performance.repository.interface';
import { PrismaPerformanceRepository } from './persistence/prisma/prisma-performance.repository';
import { ISTORAGE_SERVICE } from '../domain/service/storage.service.interface';
import { MinioStorageService } from './storage/minio-storage.service';

@Module({
    imports: [ConfigModule],
    providers: [
        PrismaService,
        {
            provide: ICONCERT_REPOSITORY,
            useClass: PrismaConcertRepository,
        },
        {
            provide: IARTIST_REPOSITORY,
            useClass: PrismaArtistRepository,
        },
        {
            provide: IPERFORMANCE_REPOSITORY,
            useClass: PrismaPerformanceRepository,
        },
        {
            provide: ISTORAGE_SERVICE,
            useClass: MinioStorageService,
        },
    ],
    exports: [ICONCERT_REPOSITORY, IARTIST_REPOSITORY, IPERFORMANCE_REPOSITORY, ISTORAGE_SERVICE, PrismaService],
})
export class ConcertInfrastructureModule { }
