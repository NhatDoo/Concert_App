import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InviteStaffCommand } from '../invite-staff.command';
import { PrismaService } from '../../../../../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(InviteStaffCommand)
export class InviteStaffHandler implements ICommandHandler<InviteStaffCommand> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(command: InviteStaffCommand) {
        const { organizerId, email, role } = command;

        // 1. Kiểm tra xem đã có lời mời PENDING nào cho email này chưa
        const existingInvitation = await this.prisma.staffInvitation.findFirst({
            where: {
                email,
                organizerId,
                status: 'PENDING'
            }
        });

        if (existingInvitation) {
            return {
                message: 'Lời mời đã tồn tại cho email này',
                invitation: existingInvitation
            };
        }

        // 2. Tạo Token ngẫu nhiên (Dùng cho link)
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Hết hạn sau 7 ngày

        // 3. Lưu vào Database
        const invitation = await this.prisma.staffInvitation.create({
            data: {
                id: uuidv4(),
                email,
                role,
                organizerId,
                token,
                status: 'PENDING',
                expiresAt
            }
        });

        console.log(`[Organizing] Invitation created for ${email}. Token: ${token}`);

        // TODO: Gửi Email chứa link: http://domain/register?token=${token}

        return {
            message: 'Lời mời đã được gửi thành công',
            token: token,
            invitationId: invitation.id
        };
    }
}
