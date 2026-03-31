import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../../../identity/domain/events/user-registered.event';
import { PrismaService } from '../../../../../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@EventsHandler(UserRegisteredEvent)
export class CreateStaffOnRegistrationHandler implements IEventHandler<UserRegisteredEvent> {
    constructor(private readonly prisma: PrismaService) { }

    async handle(event: UserRegisteredEvent) {
        console.log('[DEBUG] Received UserRegisteredEvent:', JSON.stringify(event, null, 2));
        const { userId, name, email, role, staffRole, inviteToken } = event.payload;

        if (role === 'STAFF') {
            // 1. Tìm kiếm lời mời (Ưu tiên dùng Token nếu có)
            let invitation: any = null;

            if (inviteToken) {
                invitation = await this.prisma.staffInvitation.findUnique({
                    where: { token: inviteToken, status: 'PENDING' }
                });
            }

            // Nếu không có Token hoặc Token không hợp lệ, thử tìm theo Email
            if (!invitation) {
                invitation = await this.prisma.staffInvitation.findFirst({
                    where: { email: email, status: 'PENDING' },
                    orderBy: { createdAt: 'desc' }
                });
            }

            if (invitation) {
                console.log(`[Organizing] Linking staff ${userId} (${email}) to organizer ${invitation.organizerId} via invitation`);

                await this.prisma.staff.create({
                    data: {
                        id: uuidv4(),
                        userId: userId,
                        name: name,
                        role: invitation.role,
                        organizerId: invitation.organizerId,
                        concertId: null,
                        managerId: invitation.managerId
                    }
                });

                await this.prisma.staffInvitation.update({
                    where: { id: invitation.id },
                    data: { status: 'ACCEPTED' }
                });
            } else {
                console.log(`[Organizing] Creating profile for staff ${userId} (${email}) with role ${staffRole || 'APPLICANT'}.`);

                await this.prisma.staff.create({
                    data: {
                        id: uuidv4(),
                        userId: userId,
                        name: name,
                        role: staffRole || 'APPLICANT', // Sử dụng Role người dùng chọn khi đăng ký
                        organizerId: null,
                        concertId: null,
                        managerId: null
                    }
                });
            }
        }
    }
}
