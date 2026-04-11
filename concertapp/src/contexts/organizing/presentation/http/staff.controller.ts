import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch, Get, Query, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InviteStaffCommand } from '../../application/commands/invite-staff.command';
import { UpdateStaffProfileCommand } from '../../application/commands/update-staff-profile.command';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateStaffProfileDto } from './dto';
import { PrismaService } from '../../../../prisma.service';

@ApiTags('Organizing Staff')
@Controller('organize')
export class StaffController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService
    ) { }

    @Post('staff/provision-organizer')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Provision an organizer staff record if it does not exist' })
    async provisionOrganizer(@Body() dto: { userId: string, name: string }) {
        try {
            console.log('[Provision] Receiving DTO:', dto);
            if (!dto.userId || !dto.name) {
                console.error('[Provision] Missing required fields in DTO');
                return { error: 'Missing userId or name' };
            }

            const existing = await this.prisma.staff.findFirst({
                where: { userId: dto.userId, role: 'ORGANIZER' }
            });

            if (existing) {
                console.log('[Provision] Staff record already exists for userId:', dto.userId);
                return existing;
            }

            console.log('[Provision] Creating new Staff record for organizer...');
            const newStaff = await this.prisma.staff.create({
                data: {
                    user: { connect: { id: dto.userId } },
                    name: dto.name,
                    role: 'ORGANIZER',

                }
            });
            console.log('[Provision] Successfully created staff record:', newStaff.id);
            return newStaff;
        } catch (error) {
            console.error('[Provision] Error in provisionOrganizer:', error);
            throw error;
        }
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

    @Get('staff/my-invitations')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách lời mời cho người dùng hiện tại dựa trên email' })
    async getMyInvitations(@Query('email') email: string) {
        return await this.prisma.staffInvitation.findMany({
            where: {
                email: email,
                status: 'PENDING'
            },
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
    @ApiOperation({ summary: 'Get all staff members belonging to an organizer via concert and vendor relations' })
    async getStaffList(@Param('organizerId') paramId: string) {
        // Step 1: Find all concerts belonging to the organizer
        const concerts = await this.prisma.concert.findMany({
            where: { organizerId: paramId },
            select: { id: true, name: true, organizerId: true, eventManagerId: true }
        });

        const concertIds = concerts.map(c => c.id);
        const eventManagerIds = concerts
            .map(c => c.eventManagerId)
            .filter((id): id is string => id !== null);

        // Step 2: Find all unique vendorIds assigned to these concerts
        const staffWithVendors = await this.prisma.staff.findMany({
            where: {
                concertId: { in: concertIds },
                vendorId: { not: null }
            },
            select: { vendorId: true }
        });
        const vendorIds = Array.from(new Set(staffWithVendors.map(s => s.vendorId as string)));

        // Step 3: Find staff based on concert, direct management, or belonging to a participating vendor
        const staff = await this.prisma.staff.findMany({
            where: {
                OR: [
                    { concertId: { in: concertIds } },
                    { id: { in: eventManagerIds } },
                    { vendorId: { in: vendorIds } } // Pull all employees of vendors assigned to these concerts
                ]
            },
            include: {
                manager: {
                    select: { id: true, name: true, role: true }
                },
                tasks: true,
                concert: {
                    select: { id: true, name: true, organizerId: true }
                },
                managedConcert: {
                    where: { organizerId: paramId },
                    select: { id: true, name: true, organizerId: true }
                }
            },
            orderBy: { role: 'asc' }
        });

        // Step 3: Map results to ensure each staff has a 'concert' object for the UI
        return (staff as any[]).map(s => {
            if (!s.concert && s.managedConcert && s.managedConcert.length > 0) {
                return {
                    ...s,
                    concert: s.managedConcert[0]
                };
            }
            return s;
        });
    }

    @Get('staff/discover')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Discover potential staff/managers who are not currently joined to any organizer' })
    async discoverPotentialStaff(
        @Query('role') role?: string,
        @Query('filterRole') filterRole?: string
    ) {
        let whereClause: any = { concertId: null, vendorId: null };

        if (filterRole) {
            // Support multiple roles and check both Staff.role and User.role
            const roles = filterRole.split(',').map(r => r.trim());

            whereClause.OR = [
                { role: { in: roles } },
                { user: { role: { in: roles } } }
            ];
        } else if (role) {
            // Fuzzy search by keyword
            whereClause.role = { contains: role, mode: 'insensitive' };
        }

        return await this.prisma.staff.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true, phoneNumber: true, role: true }
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

    @Get('staff/me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get current user staff records' })
    async getMyStaffRecords(@Query('userId') userId: string) {
        return await this.prisma.staff.findMany({
            where: { userId: userId },
            include: {
                tasks: true,
                concert: true,

            }


        });
    }

    @Patch('staff/profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update logged-in staff profile' })
    async updateStaffProfile(@Body() dto: UpdateStaffProfileDto, @Query('userId') userId: string) {
        if (!userId) throw new Error('User ID is required');
        const command = new UpdateStaffProfileCommand(
            userId,
            dto.name,
            dto.phoneNumber,
            dto.email,
            dto.bio,
            dto.cvUrl
        );
        return await this.commandBus.execute(command);
    }

    @Patch('staff/tasks/:taskId/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update staff task status by ID only' })
    async updateTaskStatusOnly(@Param('taskId') taskId: string, @Body() dto: { status: string }) {
        return await this.prisma.staffTask.update({
            where: { id: taskId },
            data: { status: dto.status }
        });
    }

    @Get('concert/:concertId/staffs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all staff members related to a specific concert' })
    async getStaffsByConcert(@Param('concertId') concertId: string) {
        const concert = await this.prisma.concert.findUnique({
            where: { id: concertId },
            select: { organizerId: true }
        });

        if (!concert) {
            return [];
        }

        const requirements = await this.prisma.eventRequirement.findMany({
            where: {
                concertId: concertId,
                status: 'ACCEPTED',
                vendorId: { not: null }
            },
            select: { vendorId: true }
        });
        const vendorIds = requirements.map(r => r.vendorId).filter((v): v is string => v !== null);

        return await this.prisma.staff.findMany({
            where: {
                OR: [
                    { concertId: concertId },
                    { manager: { concertId: concertId } },

                    ...(vendorIds.length > 0 ? [{ vendorId: { in: vendorIds } }] : [])
                ]
            },
            include: {
                manager: {
                    select: { id: true, name: true, role: true }
                },
                tasks: true,
                concert: {
                    select: { id: true, name: true, startDate: true }
                }
            },
            orderBy: { role: 'asc' }
        });
    }

    @Get('staff/my-tasks/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get tasks for user' })
    async getMyTasks(@Param('userId') userId: string) {
        return await this.prisma.staff.findMany({
            where: { userId: userId },
            include: {
                concert: { select: { id: true, name: true, startDate: true } },
                tasks: {
                    include: { taskManager: { select: { id: true, name: true, role: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                assignedShifts: {
                    include: {
                        shift: {
                            include: {
                                zone: true
                            }
                        }
                    }
                }
            }
        });
    }
}
