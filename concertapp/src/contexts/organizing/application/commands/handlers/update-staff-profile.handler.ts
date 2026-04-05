import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../prisma.service';
import { UpdateStaffProfileCommand } from '../update-staff-profile.command';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateStaffProfileCommand)
export class UpdateStaffProfileHandler implements ICommandHandler<UpdateStaffProfileCommand> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(command: UpdateStaffProfileCommand): Promise<void> {
        const { userId, name, phoneNumber, email, bio, cvUrl } = command;

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { staffs: true }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const staff = user.staffs[0];
        if (!staff) {
            throw new NotFoundException('Staff profile not found for this user');
        }

        // Update User info
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phoneNumber && { phoneNumber }),
                ...(email && { email }),
            }
        });

        // Update Staff info
        await this.prisma.staff.update({
            where: { id: staff.id },
            data: {
                ...(bio !== undefined && { bio }),
                ...(cvUrl !== undefined && { cvUrl }),
                ...(name && { name }), // Sync name in Staff table as well
            }
        });
    }
}
