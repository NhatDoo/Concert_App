import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../../../identity/domain/events/user-registered.event';
import { PrismaService } from '../../../../../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@EventsHandler(UserRegisteredEvent)
export class CreateStaffOnRegistrationHandler implements IEventHandler<UserRegisteredEvent> {
    constructor(private readonly prisma: PrismaService) { }

    async handle(event: UserRegisteredEvent) {
        console.log('[DEBUG] Received UserRegisteredEvent:', JSON.stringify(event, null, 2));
        const { userId, name, email, role, companyName, staffRole } = event.payload;

        // ---- VENDOR: Tạo Vendor profile ----
        if (role === 'VENDOR') {
            console.log(`[Vendor] Creating Vendor profile for user ${userId} (${email})`);
            const vendorId = uuidv4();
            await this.prisma.vendor.create({
                data: {
                    id: vendorId,
                    userId: userId,
                    companyName: companyName || name, // fallback về tên user nếu không có tên công ty
                }
            });

            // Tạo Staff record để Vendor có thể thực hiện các chức năng như recruitment, tasks...
            console.log(`[Vendor] Creating administrative Staff record for vendor ${vendorId}`);
            await this.prisma.staff.create({
                data: {
                    id: uuidv4(),
                    userId: userId,
                    name: name,
                    role: 'VENDOR_ADMIN',
                    vendorId: vendorId,
                    concertId: null,
                    managerId: null
                }
            });
            return;
        }

        // ---- STAFF: Tạo Staff profile ----
        if (role === 'STAFF') {
            // 1. Tìm kiếm lời mời (Ưu tiên dùng Token nếu có)
            let invitation: any = null;



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
                        role: staffRole || 'APPLICANT',
                        concertId: null,
                        managerId: null
                    }
                });
            }
        }
    }
}
