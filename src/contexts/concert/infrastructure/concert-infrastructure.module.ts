import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ICONCERT_REPOSITORY } from '../domain/repository/concert.repository.interface';
import { PrismaConcertRepository } from './persistence/prisma/prisma-concert.repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: ICONCERT_REPOSITORY,
            useClass: PrismaConcertRepository,
        }
    ],
    exports: [ICONCERT_REPOSITORY],
})
export class ConcertInfrastructureModule { }
