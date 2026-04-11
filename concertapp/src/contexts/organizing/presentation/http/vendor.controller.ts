import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Query, UseGuards, HttpCode, HttpStatus, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetRequirementsQuery } from '../../application/queries/get-requirements.query';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../../../../prisma.service';
import { RolesGuard } from '../../../organizing/presentation/http/roles.guard';
import { Roles } from '../../../organizing/presentation/http/roles.decorator';
import { v4 as uuidv4 } from 'uuid';
import { AssignStaffTaskDto } from './dto/staff-task.dto';
import { AssignStaffTaskCommand } from '../../application/commands/staff-task.command';

// ===== DTOs =====
export class CreateEquipmentDto {
    @IsString() name: string;
    @IsString() category: string;
    @IsString() @IsOptional() description?: string;
    @IsInt() @Type(() => Number) totalQty: number;
    @IsInt() @Type(() => Number) availableQty: number;
    @IsString() @IsOptional() imageUrl?: string;
}

export class UpdateEquipmentDto {
    @IsString() @IsOptional() name?: string;
    @IsString() @IsOptional() category?: string;
    @IsString() @IsOptional() description?: string;
    @IsInt() @Type(() => Number) @IsOptional() totalQty?: number;
    @IsInt() @Type(() => Number) @IsOptional() availableQty?: number;
    @IsString() @IsOptional() status?: string;
    @IsString() @IsOptional() imageUrl?: string;
}

// ===== Controller =====
@ApiTags('Vendor')
@ApiBearerAuth()
@Controller('vendor')
export class VendorController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus
    ) { }

    // ---------- Helper: get vendorId from JWT userId ----------
    private async getVendorId(userId: string): Promise<string> {
        // 1. Direct owner (Vendor table)
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        if (vendor) return vendor.id;

        // 2. Or is a Staff member with MANAGER or VENDOR_ADMIN role
        const staff = await this.prisma.staff.findFirst({
            where: {
                userId,
                vendorId: { not: null },
                role: { in: ['VENDOR_ADMIN', 'VENDOR', 'MANAGER'] }
            }
        });

        if (staff && staff.vendorId) {
            return staff.vendorId;
        }

        throw new ForbiddenException('Vendor profile not found for this user');
    }

    // ======================== EQUIPMENT CRUD ========================

    @Get('equipments')
    @UseGuards(RolesGuard)
    @Roles('VENDOR', 'MANAGER')
    @ApiOperation({ summary: 'Lấy danh sách thiết bị của Vendor đang đăng nhập' })
    async getEquipments(@Req() req) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.prisma.equipment.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('equipments')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Thêm thiết bị mới cho Vendor' })
    async createEquipment(@Req() req, @Body() dto: CreateEquipmentDto) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.prisma.equipment.create({
            data: {
                id: uuidv4(),
                vendorId,
                name: dto.name,
                category: dto.category,
                description: dto.description,
                totalQty: dto.totalQty,
                availableQty: dto.availableQty ?? dto.totalQty,
                imageUrl: dto.imageUrl,
                status: 'AVAILABLE',
            }
        });
    }

    @Patch('equipments/:id')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Cập nhật thiết bị' })
    async updateEquipment(@Req() req, @Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
        const vendorId = await this.getVendorId(req.user.id);
        // Verify ownership
        const eq = await this.prisma.equipment.findFirst({ where: { id, vendorId } });
        if (!eq) throw new NotFoundException('Equipment not found or not owned by this vendor');
        return this.prisma.equipment.update({
            where: { id },
            data: { ...dto }
        });
    }

    @Delete('equipments/:id')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa thiết bị' })
    async deleteEquipment(@Req() req, @Param('id') id: string) {
        const vendorId = await this.getVendorId(req.user.id);
        const eq = await this.prisma.equipment.findFirst({ where: { id, vendorId } });
        if (!eq) throw new NotFoundException('Equipment not found or not owned by this vendor');
        await this.prisma.equipment.delete({ where: { id } });
    }

    // ======================== LOGISTICS ORDERS ========================

    @Get('orders')
    @UseGuards(RolesGuard)
    @Roles('VENDOR', 'MANAGER')
    @ApiOperation({ summary: 'Lấy danh sách đơn hàng Logistics của Vendor' })
    async getOrders(@Req() req) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.prisma.logisticsOrder.findMany({
            where: { vendorId },
            include: {
                items: {
                    include: { equipment: true }
                }
            },
            orderBy: { orderDate: 'desc' },
        });
    }

    @Patch('orders/:id/status')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
    async updateOrderStatus(@Req() req, @Param('id') id: string, @Body('status') status: string) {
        const vendorId = await this.getVendorId(req.user.id);
        const order = await this.prisma.logisticsOrder.findFirst({ where: { id, vendorId } });
        if (!order) throw new NotFoundException('Order not found');

        return this.prisma.logisticsOrder.update({
            where: { id },
            data: { status }
        });
    }

    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles('VENDOR', 'MANAGER')
    @ApiOperation({ summary: 'Lấy thống kê Vendor Dashboard' })
    async getVendorStats(@Req() req) {
        const vendorId = await this.getVendorId(req.user.id);

        const [totalEquipments, totalOrders, pendingOrders, preparingOrders, totalJobs, pendingApplications] = await Promise.all([
            this.prisma.equipment.count({ where: { vendorId } }),
            this.prisma.logisticsOrder.count({ where: { vendorId } }),
            this.prisma.logisticsOrder.count({ where: { vendorId, status: 'PENDING' } }),
            this.prisma.logisticsOrder.count({ where: { vendorId, status: 'PREPARING' } }),
            this.prisma.jobPost.count({
                where: { authorStaff: { vendorId } }
            }),
            this.prisma.staffApplication.count({
                where: {
                    jobPost: { authorStaff: { vendorId } },
                    status: 'PENDING'
                }
            })
        ]);

        return {
            totalEquipments,
            totalOrders,
            pendingOrders,
            preparingOrders,
            totalJobs,
            pendingApplications
        };
    }

    // ======================== STAFF MANAGEMENT ========================

    @Get('staffs')
    @UseGuards(RolesGuard)
    @Roles('VENDOR', 'MANAGER')
    @ApiOperation({ summary: 'Lấy danh sách nhân sự của Vendor' })
    async getStaffs(@Req() req) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.prisma.staff.findMany({
            where: { vendorId },
            include: {
                user: true,
                tasks: true,
                concert: { select: { id: true, name: true, startDate: true } }
            },
        });
    }

    @Patch('staffs/:staffId/promote')
    @UseGuards(RolesGuard)
    @Roles('VENDOR') // Only Vendor Admin can promote to Manager
    @ApiOperation({ summary: 'Thăng hạng nhân sự lên MANAGER' })
    async promoteStaff(@Req() req, @Param('staffId') staffId: string) {
        const vendorId = await this.getVendorId(req.user.id);
        const staff = await this.prisma.staff.findFirst({ where: { id: staffId, vendorId } });
        if (!staff) throw new NotFoundException('Staff not found or not owned by this vendor');

        return this.prisma.staff.update({
            where: { id: staffId },
            data: { role: 'MANAGER' }
        });
    }

    @Post('staffs/:staffId/tasks')
    @UseGuards(RolesGuard)
    @Roles('VENDOR', 'MANAGER')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Vendor trực tiếp giao việc cho Staff/Manager' })
    async assignTaskToStaff(@Req() req, @Param('staffId') staffId: string, @Body() dto: AssignStaffTaskDto) {
        const vendorId = await this.getVendorId(req.user.id);
        const staff = await this.prisma.staff.findFirst({ where: { id: staffId, vendorId } });
        if (!staff) throw new NotFoundException('Staff not found or not owned by this vendor');

        let concertId = staff.concertId;

        // If staff is not assigned to a concert, try to find the latest active project for this vendor
        if (!concertId) {
            const latestRequirement = await this.prisma.eventRequirement.findFirst({
                where: { vendorId, status: 'ACCEPTED' },
                orderBy: { updatedAt: 'desc' }
            });
            if (latestRequirement) {
                concertId = latestRequirement.concertId;
            }
        }

        if (!concertId) throw new Error('Staff is not assigned to a concert and no active vendor project found');

        const command = new AssignStaffTaskCommand(
            concertId,
            staffId,
            dto.managerId || '',
            dto.taskName,
            dto.description,
            new Date(dto.dueDate)
        );
        await this.commandBus.execute(command);
        return { message: 'Task successfully created and assigned from Vendor' };
    }

    // ======================== RECRUITMENT & JOBS ========================

    private async getVendorStaffId(userId: string): Promise<string> {
        let staff = await this.prisma.staff.findFirst({
            where: { userId, role: 'VENDOR_ADMIN' }
        });

        // Backwards compatibility: Create if missing
        if (!staff) {
            const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
            if (!vendor) throw new ForbiddenException('Vendor profile not found');

            staff = await this.prisma.staff.create({
                data: {
                    id: uuidv4(),
                    userId,
                    name: 'Admin', // default name
                    role: 'VENDOR_ADMIN',
                    vendorId: vendor.id,
                }
            });
        }
        return staff.id;
    }

    @Post('jobs')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng tin tuyển dụng mới cho Vendor' })
    async createJob(@Req() req, @Body() dto: any) {
        const vendorId = await this.getVendorId(req.user.id);
        const authorId = await this.getVendorStaffId(req.user.id);
        const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });

        return this.prisma.jobPost.create({
            data: {
                id: uuidv4(),
                title: dto.title,
                description: dto.description,
                requirements: dto.requirements,
                companyName: vendor?.companyName || dto.companyName,
                companyLogo: dto.companyLogo,
                location: dto.location,
                salary: dto.salary,
                authorStaffId: authorId,
                category: dto.category || 'STAFF'
            }
        });
    }

    @Get('jobs')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Lấy danh sách tin tuyển dụng của Vendor' })
    async getJobs(@Req() req) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.prisma.jobPost.findMany({
            where: { authorStaff: { vendorId } },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        });
    }

    @Patch('jobs/:id')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Cập nhật tin tuyển dụng' })
    async updateJob(@Req() req, @Param('id') id: string, @Body() dto: any) {
        const vendorId = await this.getVendorId(req.user.id);
        const job = await this.prisma.jobPost.findFirst({
            where: { id, authorStaff: { vendorId } }
        });
        if (!job) throw new NotFoundException('Job post not found');

        return this.prisma.jobPost.update({
            where: { id },
            data: { ...dto }
        });
    }

    @Delete('jobs/:id')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa tin tuyển dụng' })
    async deleteJob(@Req() req, @Param('id') id: string) {
        const vendorId = await this.getVendorId(req.user.id);
        const job = await this.prisma.jobPost.findFirst({
            where: { id, authorStaff: { vendorId } }
        });
        if (!job) throw new NotFoundException('Job post not found');

        // Delete applications first
        await this.prisma.staffApplication.deleteMany({ where: { jobPostId: id } });
        await this.prisma.jobPost.delete({ where: { id } });
    }

    @Get('jobs/:id/applications')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Lấy danh sách ứng viên cho tin tuyển dụng' })
    async getApplications(@Req() req, @Param('id') id: string) {
        const vendorId = await this.getVendorId(req.user.id);
        const job = await this.prisma.jobPost.findFirst({
            where: { id, authorStaff: { vendorId } }
        });
        if (!job) throw new NotFoundException('Job post not found');

        return this.prisma.staffApplication.findMany({
            where: { jobPostId: id },
            include: {
                applicant: {
                    include: { user: true }
                }
            }
        });
    }

    @Patch('applications/:id/review')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Phê duyệt hoặc từ chối ứng viên' })
    async reviewApplication(@Req() req, @Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED') {
        const application = await this.prisma.staffApplication.findUnique({
            where: { id },
            include: {
                jobPost: {
                    include: { authorStaff: true }
                }
            }
        });

        if (!application) throw new NotFoundException('Application not found');

        // Map approved applicant to Vendor staff if approved
        if (status === 'APPROVED') {
            const vendorId = application.jobPost.authorStaff?.vendorId;
            if (!vendorId) throw new ForbiddenException('Cannot assign to a vendor that does not exist');

            // Find the VENDOR_ADMIN staff record to use as managerId
            const vendorAdmin = await this.prisma.staff.findFirst({
                where: { vendorId, role: { in: ['VENDOR_ADMIN', 'VENDOR'] } }
            });

            await this.prisma.staff.update({
                where: { id: application.applicantId },
                data: {
                    vendorId,
                    role: application.jobPost.title,
                    managerId: vendorAdmin?.id ?? null,
                }
            });
        }

        return this.prisma.staffApplication.update({
            where: { id },
            data: { status }
        });
    }

    // ======================== OPERATION REQUIREMENTS ========================

    @Get('requirements')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Lấy danh sách yêu cầu từ Event Manager gửi cho Vendor này' })
    async getRequirements(@Req() req, @Query('status') status?: string) {
        const vendorId = await this.getVendorId(req.user.id);
        return this.queryBus.execute(new GetRequirementsQuery({ vendorId, status }));
    }

    @Patch('requirements/:id/status')
    @UseGuards(RolesGuard)
    @Roles('VENDOR')
    @ApiOperation({ summary: 'Chấp nhận hoặc từ chối yêu cầu từ Event Manager' })
    async updateRequirementStatus(
        @Req() req,
        @Param('id') id: string,
        @Body('status') status: 'ACCEPTED' | 'REJECTED'
    ) {
        const vendorId = await this.getVendorId(req.user.id);
        const reqDoc = await this.prisma.eventRequirement.findFirst({
            where: { id, vendorId }
        });

        if (!reqDoc) throw new NotFoundException('Requirement not found or not assigned to this vendor');

        return this.prisma.eventRequirement.update({
            where: { id },
            data: { status }
        });
    }
}
