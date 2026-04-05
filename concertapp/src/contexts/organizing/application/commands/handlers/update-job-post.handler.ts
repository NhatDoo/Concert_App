import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateJobPostCommand } from '../update-job-post.command';
import { IJOB_POST_REPOSITORY } from '../../../domain/repository/job-post.repository.interface';
import type { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';
import { JobPost } from '../../../domain/entity/job-post.entity';

@CommandHandler(UpdateJobPostCommand)
export class UpdateJobPostHandler implements ICommandHandler<UpdateJobPostCommand> {
    constructor(
        @Inject(IJOB_POST_REPOSITORY)
        private readonly jobPostRepository: IJobPostRepository
    ) { }

    async execute(command: UpdateJobPostCommand): Promise<any> {
        const existingJobPost = await this.jobPostRepository.findById(command.id);
        if (!existingJobPost) {
            throw new NotFoundException(`Job post with ID ${command.id} not found`);
        }

        const updatedJobPost = new JobPost(
            existingJobPost.id,
            command.data.title ?? existingJobPost.title,
            command.data.description ?? existingJobPost.description,
            command.data.requirements ?? existingJobPost.requirements,
            command.data.status ?? existingJobPost.status,
            command.data.companyName ?? existingJobPost.companyName,
            command.data.companyLogo ?? existingJobPost.companyLogo,
            command.data.location ?? existingJobPost.location,
            command.data.salary ?? existingJobPost.salary,
            existingJobPost.organizerId,
            existingJobPost.authorId,
            existingJobPost.createdAt,
            new Date()
        );

        await this.jobPostRepository.update(updatedJobPost);
        return updatedJobPost;
    }
}
