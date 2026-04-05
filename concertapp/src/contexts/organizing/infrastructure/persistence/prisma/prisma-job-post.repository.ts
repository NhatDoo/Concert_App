import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { JobPost } from '../../../domain/entity/job-post.entity';
import { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';

@Injectable()
export class PrismaJobPostRepository implements IJobPostRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(prismaJobPost: any): JobPost {
        return new JobPost(
            prismaJobPost.id,
            prismaJobPost.title,
            prismaJobPost.description,
            prismaJobPost.requirements,
            prismaJobPost.status as 'OPEN' | 'CLOSED',
            prismaJobPost.companyName || '',
            prismaJobPost.companyLogo || '',
            prismaJobPost.location || '',
            prismaJobPost.salary || '',
            prismaJobPost.organizerId,
            prismaJobPost.authorId,
            prismaJobPost.createdAt,
            prismaJobPost.updatedAt,
            prismaJobPost.author ? {
                name: prismaJobPost.author.name,
                role: prismaJobPost.author.role
            } : undefined
        );
    }

    async save(jobPost: JobPost): Promise<void> {
        await this.prisma.jobPost.create({
            data: {
                id: jobPost.id,
                title: jobPost.title,
                description: jobPost.description,
                requirements: jobPost.requirements,
                status: jobPost.status,
                companyName: jobPost.companyName,
                companyLogo: jobPost.companyLogo,
                location: jobPost.location,
                salary: jobPost.salary,
                organizerId: jobPost.organizerId,
                authorId: jobPost.authorId
            }
        });
    }

    async update(jobPost: JobPost): Promise<void> {
        await this.prisma.jobPost.update({
            where: { id: jobPost.id },
            data: {
                title: jobPost.title,
                description: jobPost.description,
                requirements: jobPost.requirements,
                status: jobPost.status,
                companyName: jobPost.companyName,
                companyLogo: jobPost.companyLogo,
                location: jobPost.location,
                salary: jobPost.salary
            }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.staffApplication.deleteMany({ where: { jobPostId: id } });
        await this.prisma.jobPost.delete({ where: { id } });
    }

    async findById(id: string): Promise<JobPost | null> {
        const prismaJobPost = await this.prisma.jobPost.findUnique({
            where: { id },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });
        return prismaJobPost ? this.mapToEntity(prismaJobPost) : null;
    }

    async findByOrganizer(organizerId: string): Promise<JobPost[]> {
        const prismaJobPosts = await this.prisma.jobPost.findMany({
            where: { organizerId },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });
        return prismaJobPosts.map(post => this.mapToEntity(post));
    }

    async findAll(filters?: { authorId?: string; organizerId?: string; authorRole?: string; includeClosed?: boolean }): Promise<JobPost[]> {
        const where: any = {};
        if (filters?.authorId) where.authorId = filters.authorId;
        if (filters?.organizerId) where.organizerId = filters.organizerId;
        if (filters?.authorRole) {
            where.author = { role: filters.authorRole };
        }
        if (!filters?.includeClosed) where.status = 'OPEN';

        const prismaJobPosts = await this.prisma.jobPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });

        // We might want to keep the author info in the return, but for strict DDD entity mapping:
        return prismaJobPosts.map(post => this.mapToEntity(post));
    }
}
