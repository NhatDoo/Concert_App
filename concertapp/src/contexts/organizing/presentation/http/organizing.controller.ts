import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch, Get, Query, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { GetOrganizerStatsQuery } from '../../application/queries/get-organizer-stats.query';
import { GetConcertStaffQuery } from '../../application/queries/get-concert-staff.query';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssignLocationCommand } from '../../application/commands/assign-location.command';
import { AddLogisticsTaskCommand, UpdateLogisticsStatusCommand } from '../../application/commands/logistics.command';
import { AddEquipmentCommand, AddStaffCommand } from '../../application/commands/equipment-staff.command';
import { AssignLocationDto } from './dto/assign-location.dto';
import { AddLogisticsDto, UpdateLogisticsStatusDto, AddEquipmentDto, AddStaffDto } from './dto/management.dto';
import { AssignStaffTaskDto, UpdateStaffTaskDto } from './dto/staff-task.dto';
import { StaffTaskStatus } from '../../domain/entity/staff-task.entity';
import { AssignStaffTaskCommand, UpdateStaffTaskCommand } from '../../application/commands/staff-task.command';
import { BulkAddStaffCommand } from '../../application/commands/bulk-add-staff.command';
import { InviteStaffCommand } from '../../application/commands/invite-staff.command';
import { CreateJobPostCommand } from '../../application/commands/create-job-post.command';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { CreateJobPostDto, UpdateJobPostDto, CreateApplicationDto, ReviewApplicationDto } from './dto/recruitment.dto';
import { PrismaService } from '../../../../prisma.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvStorageService } from '../../infrastructure/storage/cv-storage.service';

@ApiTags('Organizing')
@Controller('organize')
export class OrganizingController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService,
        private readonly cvStorageService: CvStorageService
    ) { }

    @Get('stats/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get dashboard stats for an organizer' })
    async getStats(@Param('organizerId') organizerId: string) {
        return this.queryBus.execute(new GetOrganizerStatsQuery(organizerId));
    }

    @Get(':concertId/staff')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all staff workers assigned to the concert' })
    async getStaff(@Param('concertId') concertId: string) {
        return this.queryBus.execute(new GetConcertStaffQuery(concertId));
    }

    @Post('location')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign a location to a corresponding concert organization' })
    @ApiResponse({ status: 200, description: 'Location successfully assigned and synched' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid UUID)' })
    async assignLocation(@Body() dto: AssignLocationDto): Promise<{ message: string }> {
        const command = new AssignLocationCommand(
            dto.concertId,
            dto.locationName,
            dto.address,
            dto.capacity
        );

        await this.commandBus.execute(command);

        return {
            message: 'Location successfully assigned to Concert logic.'
        };
    }

    @Post(':concertId/logistics')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a logistics task to the concert' })
    async addLogistics(@Param('concertId') concertId: string, @Body() dto: AddLogisticsDto) {
        const command = new AddLogisticsTaskCommand(concertId, dto.taskName, dto.vendor, dto.cost);
        await this.commandBus.execute(command);
        return { message: 'Logistics task added' };
    }

    @Patch(':concertId/logistics/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update status of a logistics task' })
    async updateLogisticsStatus(
        @Param('concertId') concertId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateStaffTaskDto // Shared status DTO
    ) {
        // Assume LogisticsStatus matches StaffTaskStatus for this generic check or use separate
        const command = new UpdateLogisticsStatusCommand(concertId, taskId, dto.status as any);
        await this.commandBus.execute(command);
        return { message: 'Logistics status updated' };
    }

    @Post(':concertId/equipments')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add equipment to the concert' })
    async addEquipment(@Param('concertId') concertId: string, @Body() dto: AddEquipmentDto) {
        const command = new AddEquipmentCommand(concertId, dto.name, dto.details);
        await this.commandBus.execute(command);
        return { message: 'Equipment added' };
    }

    @Post(':concertId/staff')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add staff member to the concert organization' })
    async addStaff(@Param('concertId') concertId: string, @Body() dto: AddStaffDto) {
        const command = new AddStaffCommand(concertId, dto.userId, dto.name, dto.role);
        await this.commandBus.execute(command);
        return { message: 'Staff member added' };
    }

    @Post(':concertId/staff/bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk add staff members to the concert' })
    async bulkAddStaff(
        @Param('concertId') concertId: string,
        @Body() body: { staffMembers: Array<{ userId: string, name: string, role: string }> }
    ) {
        const command = new BulkAddStaffCommand(concertId, body.staffMembers);
        await this.commandBus.execute(command);
        return { message: `${body.staffMembers.length} staff members added` };
    }

    @Post(':concertId/staff/:staffId/tasks')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Assign a task to a specific staff member' })
    async assignTaskToStaff(
        @Param('concertId') concertId: string,
        @Param('staffId') staffId: string,
        @Body() dto: AssignStaffTaskDto
    ) {
        const command = new AssignStaffTaskCommand(concertId, staffId, dto.description);
        await this.commandBus.execute(command);
        return { message: 'Task successfully assigned to staff member' };
    }

    @Patch(':concertId/staff/:staffId/tasks/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update the status of a staff task' })
    async updateStaffTaskStatus(
        @Param('concertId') concertId: string,
        @Param('staffId') staffId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateStaffTaskDto
    ) {
        const command = new UpdateStaffTaskCommand(concertId, staffId, taskId, dto.status as StaffTaskStatus);
        await this.commandBus.execute(command);
        return { message: 'Staff task status updated' };
    }

    @Post('staff/invite')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Invite a staff member via email' })
    async inviteStaff(@Body() dto: InviteStaffDto) {
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        return await this.prisma.staffInvitation.create({
            data: {
                id: uuidv4(),
                email: dto.email,
                role: dto.role,
                organizerId: dto.organizerId,
                token: token,
                expiresAt: expiresAt,
                managerId: dto.managerId
            }
        });
    }

    @Get('staff/invitations')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get invitations, filtered by organizerId, managerId or targeted email' })
    async getInvitations(
        @Query('organizerId') organizerId?: string,
        @Query('managerId') managerId?: string,
        @Query('email') email?: string
    ) {
        let whereClause: any = { status: 'PENDING' };
        if (organizerId) whereClause.organizerId = organizerId;
        if (managerId) whereClause.managerId = managerId;
        if (email) whereClause.email = email;

        return await this.prisma.staffInvitation.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
    }

    @Post('staff/join')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Join an organizers team using an invite key' })
    async joinStaff(@Body() dto: { inviteKey?: string, invitationId?: string, userId: string, name: string }) {
        if (!dto.inviteKey && !dto.invitationId) {
            throw new Error('Cần cung cấp mã mời (Invite Key) hoặc ID lời mời');
        }

        let invitation: any = null;

        if (dto.invitationId) {
            invitation = await this.prisma.staffInvitation.findUnique({
                where: { id: dto.invitationId, status: 'PENDING' as any }
            });
        } else if (dto.inviteKey) {
            invitation = await this.prisma.staffInvitation.findFirst({
                where: { token: dto.inviteKey, status: 'PENDING' }
            });
        }

        if (!invitation) {
            throw new Error('Lời mời không tồn tại hoặc đã được xử lý');
        }

        const staff = await this.prisma.staff.create({
            data: {
                id: uuidv4(),
                userId: dto.userId,
                name: dto.name,
                role: invitation.role,
                organizerId: invitation.organizerId,
                managerId: invitation.managerId
            }
        });

        await this.prisma.staffInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' }
        });

        return { message: 'Bạn đã gia nhập đội ngũ thành công!', staffId: staff.id };
    }

    @Get('staff/list/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all staff members belonging to an organizer with hierarchy' })
    async getStaffList(@Param('organizerId') organizerId: string) {
        return await this.prisma.staff.findMany({
            where: { organizerId: organizerId },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { role: 'asc' }
        });
    }

    @Get('staff/discover')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Discover potential staff/managers who are not currently joined to any organizer' })
    async discoverPotentialStaff(
        @Query('role') role?: string,
        @Query('filterRole') filterRole?: string
    ) {
        let whereClause: any = { organizerId: null };

        if (filterRole) {
            // Exact role filter - for role-based marketplace (e.g., Organizer sees only EVENT_MANAGERs)
            whereClause.role = filterRole;
        } else if (role) {
            // Fuzzy search by keyword
            whereClause.role = { contains: role, mode: 'insensitive' };
        }

        return await this.prisma.staff.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true, phoneNumber: true }
                }
            }
        });
    }

    @Post('staff/:staffId/invite-direct')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Directly invite a specific staff member in-app' })
    async inviteDirect(@Param('staffId') staffId: string, @Body() dto: { organizerId: string, role: string, managerId?: string }) {
        const staff = await this.prisma.staff.findUnique({
            where: { id: staffId },
            include: { user: true }
        });

        if (!staff) throw new Error('Staff member not found');

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        return await this.prisma.staffInvitation.create({
            data: {
                id: uuidv4(),
                email: staff.user.email,
                role: dto.role || staff.role,
                organizerId: dto.organizerId,
                token: token,
                expiresAt: expiresAt,
                managerId: dto.managerId
            }
        });
    }

    @Delete('staff/:staffId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a staff member from the team' })
    async removeStaff(@Param('staffId') staffId: string) {
        // Prepare to delete dependencies before removing staff to avoid foreign key violations
        await this.prisma.staffApplication.deleteMany({
            where: { applicantId: staffId }
        });
        await this.prisma.staffTask.deleteMany({
            where: { staffId: staffId }
        });

        // Delete the staff member
        await this.prisma.staff.delete({
            where: { id: staffId }
        });

        return { message: 'Nhân sự đã được gỡ bỏ khỏi Team' };
    }

    @Patch('staff/profile/:staffId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update staff member professional profile (CV, Bio)' })
    async updateStaffProfile(@Param('staffId') staffId: string, @Body() dto: { cvUrl: string, bio: string, name?: string }) {
        return await this.prisma.staff.update({
            where: { id: staffId },
            data: {
                cvUrl: dto.cvUrl,
                bio: dto.bio,
                name: dto.name
            }
        });
    }

    @Get('staff/me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get current user staff records' })
    async getMyStaffRecords(@Query('userId') userId: string) {
        return await this.prisma.staff.findMany({
            where: { userId: userId },
            include: {
                tasks: true
            }
        });
    }

    // -------------------------------------------------------------------------
    //  RECRUITMENT & JOB BOARD (JobsGO Style)
    // -------------------------------------------------------------------------

    @Post('jobs')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new job posting' })
    async createJobPost(@Body() dto: CreateJobPostDto) {
        const command = new CreateJobPostCommand(
            dto.title,
            dto.description,
            dto.requirements,
            dto.companyName || '',
            dto.companyLogo || '',
            dto.location || '',
            dto.salary || '',
            dto.organizerId,
            dto.authorId
        );
        return await this.commandBus.execute(command);
    }

    @Get('jobs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get active job postings, optionally filtered by author or organizer' })
    async getJobs(
        @Query('authorId') authorId?: string,
        @Query('organizerId') organizerId?: string,
        @Query('includeClosed') includeClosed?: string
    ) {
        let whereClause: any = {};
        if (includeClosed !== 'true') {
            whereClause.status = 'OPEN';
        }
        if (authorId) whereClause.authorId = authorId;
        if (organizerId) whereClause.organizerId = organizerId;

        return await this.prisma.jobPost.findMany({
            where: whereClause,
            include: {
                author: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Patch('jobs/:id')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a job posting' })
    async updateJobPost(@Param('id') id: string, @Body() dto: UpdateJobPostDto) {
        return await this.prisma.jobPost.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.requirements !== undefined && { requirements: dto.requirements }),
                ...(dto.companyName !== undefined && { companyName: dto.companyName }),
                ...(dto.companyLogo !== undefined && { companyLogo: dto.companyLogo }),
                ...(dto.location !== undefined && { location: dto.location }),
                ...(dto.salary !== undefined && { salary: dto.salary }),
                ...(dto.status !== undefined && { status: dto.status }),
            }
        });
    }

    @Delete('jobs/:id')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a job posting and its applications' })
    async deleteJobPost(@Param('id') id: string) {
        await this.prisma.staffApplication.deleteMany({ where: { jobPostId: id } });
        await this.prisma.jobPost.delete({ where: { id } });
        return { message: 'Tin tuyển dụng đã được xóa thành công' };
    }

    @Get('jobs/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get details of a specific job post' })
    async getJobById(@Param('id') id: string) {
        return await this.prisma.jobPost.findUnique({
            where: { id },
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

    @Get('organizer/:organizerId/jobs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all job postings for a specific organizer' })
    async getJobsByOrganizer(@Param('organizerId') organizerId: string) {
        return await this.prisma.jobPost.findMany({
            where: { organizerId }
        });
    }

    @Get('applications')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all applications, optionally filtering by applicantId' })
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
    @ApiOperation({ summary: 'Upload CV to MinIo CV bucket' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadCv(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('Tệp CV không được tìm thấy');

        const fileName = `${uuidv4()}-${file.originalname}`;
        const url = await this.cvStorageService.uploadCv(fileName, file.buffer, file.mimetype);

        return { url };
    }

    @Get('jobs/:jobPostId/applications')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all applications for a specific job post' })
    async getJobApplications(@Param('jobPostId') jobPostId: string) {
        return await this.prisma.staffApplication.findMany({
            where: { jobPostId },
            include: {
                applicant: {
                    select: { id: true, name: true, bio: true, cvUrl: true }
                }
            }
        });
    }

    @Patch('applications/:id/review')
    @Roles('MANAGER', 'ORGANIZER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Approve or reject a job application' })
    async reviewApplication(@Param('id') id: string, @Body() dto: ReviewApplicationDto) {
        const app = await this.prisma.staffApplication.findUnique({
            where: { id },
            include: { jobPost: true }
        });

        if (!app) return { message: 'Application not found' };

        if (dto.status === 'APPROVED') {
            // Move applicant into the organizational structure
            await this.prisma.staff.update({
                where: { id: app.applicantId },
                data: {
                    organizerId: app.jobPost.organizerId,
                    managerId: app.jobPost.authorId,
                    role: app.jobPost.title // Use job title as their specific role
                }
            });
        }

        return await this.prisma.staffApplication.update({
            where: { id },
            data: { status: dto.status }
        });
    }

    @Get('staff/my-tasks/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all concert assignments and tasks for a specific staff user' })
    async getMyTasks(@Param('userId') userId: string) {
        return await this.prisma.staff.findMany({
            where: { userId: userId },
            include: {
                concert: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true
                    }
                },
                tasks: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    @Post('reports')
    @Roles('EVENT_MANAGER', 'MANAGER')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Submit final event report' })
    async submitReport(@Body() dto: any) {
        return this.prisma.eventReport.create({
            data: {
                organizerId: dto.organizerId,
                authorId: dto.authorId,
                concertId: dto.concertId,
                concertName: dto.concertName,
                budgetAudit: parseFloat(dto.budgetAudit) || 0,
                marketingReach: parseInt(dto.marketingReach) || 0,
                staffEvaluation: dto.staffEvaluation,
                finalStatus: dto.finalStatus || 'SUCCESS',
                notes: dto.notes
            }
        });
    }

    @Get('reports/:organizerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all event reports for an organizer' })
    async getReports(@Param('organizerId') organizerId: string) {
        return this.prisma.eventReport.findMany({
            where: { organizerId },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}
