import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IORGANIZE_REPOSITORY } from '../domain/repository/organize.repository.interface';
import { PrismaOrganizeRepository } from './persistence/prisma/prisma-organize.repository';
import { CvStorageService } from './storage/cv-storage.service';

@Module({
    providers: [
        PrismaService,
        {
            provide: IORGANIZE_REPOSITORY,
            useClass: PrismaOrganizeRepository,
        },
        CvStorageService
    ],
    exports: [IORGANIZE_REPOSITORY, PrismaService, CvStorageService],
})
export class OrganizingInfrastructureModule { }
