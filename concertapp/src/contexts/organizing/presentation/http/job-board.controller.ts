import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch, Get, Query, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { CreateJobPostCommand } from '../../application/commands/create-job-post.command';
import { UpdateJobPostCommand } from '../../application/commands/update-job-post.command';
import { DeleteJobPostCommand } from '../../application/commands/delete-job-post.command';
import { GetJobsQuery } from '../../application/queries/get-jobs.query';
import { GetJobByIdQuery } from '../../application/queries/get-job-by-id.query';
import { PrismaService } from '../../../../prisma.service';
import { CvStorageService } from '../../infrastructure/storage/cv-storage.service';
import { CreateJobPostDto, UpdateJobPostDto, CreateApplicationDto, ReviewApplicationDto } from './dto';

@ApiTags('Organizing Jobs')
@Controller('organize')
export class JobBoardController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService,
        private readonly cvStorageService: CvStorageService
    ) { }

    @Post('jobs')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new job posting' })
    async createJobPost(@Body() dto: CreateJobPostDto) {
        try {
            const command = new CreateJobPostCommand(
                dto.title,
                dto.description,
                dto.requirements,
                dto.companyName || '',
                dto.companyLogo || '',
                dto.location || '',
                dto.salary || '',
                dto.organizerId,
                dto.authorId,
                dto.category
            );
            return await this.commandBus.execute(command);
        } catch (error) {
            throw error;
        }
    }

    @Get('jobs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get active job postings' })
    async getJobs(
        @Query('authorId') authorId?: string,
        @Query('organizerId') organizerId?: string,
        @Query('authorRole') authorRole?: string,
        @Query('includeClosed') includeClosed?: string
    ) {
        return await this.queryBus.execute(new GetJobsQuery({
            authorId,
            organizerId,
            authorRole,
            includeClosed: includeClosed === 'true'
        }));
    }

    @Patch('jobs/:id')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a job posting' })
    async updateJobPost(@Param('id') id: string, @Body() dto: UpdateJobPostDto) {
        return await this.commandBus.execute(new UpdateJobPostCommand(id, dto));
    }

    @Delete('jobs/:id')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a job posting' })
    async deleteJobPost(@Param('id') id: string) {
        await this.commandBus.execute(new DeleteJobPostCommand(id));
        return { message: 'Tin tuyển dụng đã được xóa thành công' };
    }

    @Get('jobs/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get details of a specific job post' })
    async getJobById(@Param('id') id: string) {
        return await this.queryBus.execute(new GetJobByIdQuery(id));
    }

    @Get('applications')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all applications' })
    async getApplications(@Query('applicantId') applicantId?: string) {
        if (applicantId) {
            return await this.prisma.staffApplication.findMany({
                where: { applicantId },
                include: { jobPost: true },
                orderBy: { createdAt: 'desc' }
            });
        }
        return await this.prisma.staffApplication.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    @Post('applications')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Apply for a job posting' })
    async applyToJob(@Body() dto: CreateApplicationDto) {
        return await this.prisma.staffApplication.create({
            data: {
                applicantId: dto.applicantId,
                jobPostId: dto.jobPostId,
                cvUrl: dto.cvUrl,
                message: dto.message
            }
        });
    }

    @Post('applications/upload-cv')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Upload CV' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadCv(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('File not found');
        const fileName = `${uuidv4()}-${file.originalname}`;
        const url = await this.cvStorageService.uploadCv(fileName, file.buffer, file.mimetype);
        return { url };
    }

    @Patch('applications/:id/review')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Review application' })
    async reviewApplication(@Param('id') id: string, @Body() dto: ReviewApplicationDto) {
        const app = await this.prisma.staffApplication.findUnique({
            where: { id },
            include: { jobPost: true }
        });

        if (!app) return { message: 'Application not found' };

        if (dto.status === 'APPROVED') {
            // Check if this job belongs to a vendor (jobPost.organizerId is actually vendorId)
            const isVendorJob = await this.prisma.vendor.findUnique({
                where: { id: app.jobPost.organizerId }
            });

            if (isVendorJob) {
                await this.prisma.staff.update({
                    where: { id: app.applicantId },
                    data: {
                        vendorId: app.jobPost.organizerId,
                        organizerId: null,
                        managerId: app.jobPost.authorId,
                        role: app.jobPost.title
                    }
                });
            } else {
                await this.prisma.staff.update({
                    where: { id: app.applicantId },
                    data: {
                        organizerId: app.jobPost.organizerId,
                        managerId: app.jobPost.authorId,
                        role: app.jobPost.title
                    }
                });
            }
        }

        return await this.prisma.staffApplication.update({
            where: { id },
            data: { status: dto.status }
        });
    }
}
