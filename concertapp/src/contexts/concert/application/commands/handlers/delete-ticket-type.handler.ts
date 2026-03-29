import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { DeleteTicketTypeCommand } from '../delete-ticket-type.command';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(DeleteTicketTypeCommand)
export class DeleteTicketTypeHandler implements ICommandHandler<DeleteTicketTypeCommand, void> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(command: DeleteTicketTypeCommand): Promise<void> {
        const { concertId, ticketType } = command;

        const pool = await this.prisma.ticketPool.findUnique({
            where: { concertId_ticketType: { concertId, ticketType } }
        });

        if (!pool) {
            throw new BadRequestException(`Không tìm thấy loại vé "${ticketType}"`);
        }

        if (pool.soldCount > 0) {
            throw new BadRequestException(`Không thể xóa loại vé "${ticketType}" vì đã có ${pool.soldCount} vé được bán`);
        }

        await this.prisma.ticketPool.delete({
            where: { concertId_ticketType: { concertId, ticketType } }
        });
    }
}
