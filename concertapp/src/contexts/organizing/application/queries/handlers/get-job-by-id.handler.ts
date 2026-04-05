import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetJobByIdQuery } from '../get-job-by-id.query';
import { IJOB_POST_REPOSITORY } from '../../../domain/repository/job-post.repository.interface';
import type { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';
import { PrismaService } from '../../../../../prisma.service';

@QueryHandler(GetJobByIdQuery)
export class GetJobByIdHandler implements IQueryHandler<GetJobByIdQuery> {
    constructor(
        @Inject(IJOB_POST_REPOSITORY)
        private readonly jobPostRepository: IJobPostRepository,
        private readonly prisma: PrismaService // For detailed include
    ) { }

    async execute(query: GetJobByIdQuery): Promise<any> {
        // Detailed fetch often bypasses simple entity repository for "GetById" if it needs massive includes
        // but let's try to keep it clean or use the repository if it covers it.
        // The controller previously had significant includes.

        return await this.prisma.jobPost.findUnique({
            where: { id: query.id },
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                        bio: true,
                        user: {
                            select: {
                                phoneNumber: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }
}
