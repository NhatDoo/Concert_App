import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateJobPostCommand } from '../create-job-post.command';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(CreateJobPostCommand)
export class CreateJobPostHandler implements ICommandHandler<CreateJobPostCommand> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(command: CreateJobPostCommand): Promise<any> {
        // Here we could implement a full domain Entity creation for JobPost. 
        // For simplicity towards persistence:

        return await this.prisma.jobPost.create({
            data: {
                title: command.title,
                description: command.description,
                requirements: command.requirements,
                companyName: command.companyName,
                companyLogo: command.companyLogo,
                location: command.location,
                salary: command.salary,
                organizerId: command.organizerId,
                authorId: command.authorId,
                status: 'OPEN'
            }
        });
    }
}
