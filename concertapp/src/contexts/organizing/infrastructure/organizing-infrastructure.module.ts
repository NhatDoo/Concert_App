import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IORGANIZE_REPOSITORY } from '../domain/repository/organize.repository.interface';
import { PrismaOrganizeRepository } from './persistence/prisma/prisma-organize.repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: IORGANIZE_REPOSITORY,
            useClass: PrismaOrganizeRepository,
        }
    ],
    exports: [IORGANIZE_REPOSITORY],
})
export class OrganizingInfrastructureModule { }
