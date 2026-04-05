import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IORGANIZE_REPOSITORY } from '../domain/repository/organize.repository.interface';
import { PrismaOrganizeRepository } from './persistence/prisma/prisma-organize.repository';
import { CvStorageService } from './storage/cv-storage.service';
import { IJOB_POST_REPOSITORY } from '../domain/repository/job-post.repository.interface';
import { PrismaJobPostRepository } from './persistence/prisma/prisma-job-post.repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: IORGANIZE_REPOSITORY,
            useClass: PrismaOrganizeRepository,
        },
        {
            provide: IJOB_POST_REPOSITORY,
            useClass: PrismaJobPostRepository,
        },
        CvStorageService
    ],
    exports: [IORGANIZE_REPOSITORY, IJOB_POST_REPOSITORY, PrismaService, CvStorageService],
})
export class OrganizingInfrastructureModule { }
