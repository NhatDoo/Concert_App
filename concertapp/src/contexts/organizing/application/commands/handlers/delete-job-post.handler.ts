import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJobPostCommand } from '../delete-job-post.command';
import { IJOB_POST_REPOSITORY } from '../../../domain/repository/job-post.repository.interface';
import type { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';

@CommandHandler(DeleteJobPostCommand)
export class DeleteJobPostHandler implements ICommandHandler<DeleteJobPostCommand> {
    constructor(
        @Inject(IJOB_POST_REPOSITORY)
        private readonly jobPostRepository: IJobPostRepository
    ) { }

    async execute(command: DeleteJobPostCommand): Promise<any> {
        const existingJobPost = await this.jobPostRepository.findById(command.id);
        if (!existingJobPost) {
            throw new NotFoundException(`Job post with ID ${command.id} not found`);
        }

        await this.jobPostRepository.delete(command.id);
        return { success: true };
    }
}
