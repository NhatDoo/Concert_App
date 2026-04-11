import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { JobPost } from '../../../domain/entity/job-post.entity';
import { IJobPostRepository } from '../../../domain/repository/job-post.repository.interface';

@Injectable()
export class PrismaJobPostRepository implements IJobPostRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(prismaJobPost: any): any {
        const author = prismaJobPost.authorStaff
            ? {
                id: prismaJobPost.authorStaffId,
                name: prismaJobPost.authorStaff.name,
                role: prismaJobPost.authorStaff.role,
                user: prismaJobPost.authorStaff.user
            }
            : {
                id: prismaJobPost.authorUserId,
                name: prismaJobPost.authorUser?.name || 'Ban tổ chức',
                role: 'ORGANIZER',
                user: { email: prismaJobPost.authorUser?.email }
            };

        return {
            id: prismaJobPost.id,
            title: prismaJobPost.title,
            description: prismaJobPost.description,
            requirements: prismaJobPost.requirements,
            status: prismaJobPost.status,
            companyName: prismaJobPost.companyName || '',
            companyLogo: prismaJobPost.companyLogo || '',
            location: prismaJobPost.location || '',
            salary: prismaJobPost.salary || '',
            concertId: prismaJobPost.concertId,
            organizerId: prismaJobPost.concert?.organizerId || prismaJobPost.authorUserId, // Added for frontend
            authorId: prismaJobPost.authorStaffId || prismaJobPost.authorUserId, // Added for frontend
            createdAt: prismaJobPost.createdAt,
            updatedAt: prismaJobPost.updatedAt,
            category: prismaJobPost.category || 'STAFF',
            author: author
        };
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
                concertId: jobPost.concertId,
                authorStaffId: jobPost.authorStaffId,
                authorUserId: jobPost.authorUserId,
                category: jobPost.category
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
                salary: jobPost.salary,
                category: jobPost.category
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
                authorStaff: {
                    select: {
                        name: true,
                        role: true,
                        user: { select: { email: true, phoneNumber: true } }
                    }
                },
                authorUser: {
                    select: { name: true, email: true }
                },
                concert: {
                    select: { organizerId: true }
                }
            }
        });
        return prismaJobPost ? this.mapToEntity(prismaJobPost) : null;
    }

    async findByOrganizer(organizerId: string): Promise<JobPost[]> {
        const prismaJobPosts = await this.prisma.jobPost.findMany({
            where: {
                OR: [
                    { concert: { organizerId: organizerId } },
                    { authorUserId: organizerId },
                    { authorStaff: { vendorId: organizerId } }
                ]
            },
            include: {
                authorStaff: {
                    select: {
                        name: true,
                        role: true,
                        user: { select: { email: true, phoneNumber: true } }
                    }
                },
                authorUser: {
                    select: { name: true, email: true }
                },
                concert: {
                    select: { organizerId: true }
                }
            }
        });
        return prismaJobPosts.map(post => this.mapToEntity(post));
    }

    async findAll(filters?: { authorId?: string; organizerId?: string; authorRole?: string; includeClosed?: boolean }): Promise<JobPost[]> {
        const where: any = {};
        if (filters?.authorId) {
            where.OR = [
                { authorStaffId: filters.authorId },
                { authorUserId: filters.authorId }
            ];
        }
        if (filters?.organizerId) {
            where.OR = [
                { concert: { organizerId: filters.organizerId } },
                { authorUserId: filters.organizerId },
                { authorStaff: { vendorId: filters.organizerId } }
            ];
        }
        if (filters?.authorRole) {
            where.authorStaff = { role: filters.authorRole };
        }
        if (!filters?.includeClosed) where.status = 'OPEN';

        const prismaJobPosts = await this.prisma.jobPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                authorStaff: {
                    select: {
                        name: true,
                        role: true,
                        user: { select: { email: true, phoneNumber: true } }
                    }
                },
                authorUser: {
                    select: { name: true, email: true }
                },
                concert: {
                    select: { organizerId: true }
                }
            }
        });

        return prismaJobPosts.map(post => this.mapToEntity(post));
    }
}
