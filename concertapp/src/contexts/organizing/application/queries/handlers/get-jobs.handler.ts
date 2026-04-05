import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetJobsQuery } from '../get-jobs.query';
import { IJOB_POST_REPOSITORY } from '../../../domain/repository/job-post.repository.interface';
import type { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';

@QueryHandler(GetJobsQuery)
export class GetJobsHandler implements IQueryHandler<GetJobsQuery> {
    constructor(
        @Inject(IJOB_POST_REPOSITORY)
        private readonly jobPostRepository: IJobPostRepository
    ) { }

    async execute(query: GetJobsQuery): Promise<any> {
        return await this.jobPostRepository.findAll(query.filters);
    }
}
