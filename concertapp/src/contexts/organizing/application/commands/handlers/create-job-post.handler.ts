import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateJobPostCommand } from '../create-job-post.command';
import { IJOB_POST_REPOSITORY } from '../../../domain/repository/job-post.repository.interface';
import type { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';
import { JobPost } from '../../../domain/entity/job-post.entity';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateJobPostCommand)
export class CreateJobPostHandler implements ICommandHandler<CreateJobPostCommand> {
    constructor(
        @Inject(IJOB_POST_REPOSITORY)
        private readonly jobPostRepository: IJobPostRepository
    ) { }

    async execute(command: CreateJobPostCommand): Promise<any> {
        const jobPost = JobPost.create(
            uuidv4(),
            command.title,
            command.description,
            command.requirements,
            command.organizerId,
            command.authorId,
            {
                companyName: command.companyName,
                companyLogo: command.companyLogo,
                location: command.location,
                salary: command.salary
            }
        );

        await this.jobPostRepository.save(jobPost);
        return jobPost;
    }
}
