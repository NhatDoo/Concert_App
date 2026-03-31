import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateTicketPriceCommand } from '../update-ticket-price.command';
import { PrismaService } from '../../../../../prisma.service';
import { ICONCERT_REPOSITORY } from '../../../domain/repository/concert.repository.interface';
import type { IConcertRepository } from '../../../domain/repository/concert.repository.interface';

@CommandHandler(UpdateTicketPriceCommand)
export class UpdateTicketPriceHandler implements ICommandHandler<UpdateTicketPriceCommand, void> {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(ICONCERT_REPOSITORY) private readonly concertRepo: IConcertRepository,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: UpdateTicketPriceCommand): Promise<void> {
        const { concertId, ticketType, newPrice, quantity } = command;

        const pool = await this.prisma.ticketPool.findUnique({
            where: { concertId_ticketType: { concertId, ticketType } }
        });

        if (!pool) {
            throw new BadRequestException(`Không tìm thấy loại vé "${ticketType}"`);
        }

        if (quantity !== undefined && quantity < pool.soldCount) {
            throw new BadRequestException(`Số lượng mới (${quantity}) không thể nhỏ hơn số vé đã bán (${pool.soldCount})`);
        }

        await this.prisma.ticketPool.update({
            where: { concertId_ticketType: { concertId, ticketType } },
            data: {
                price: newPrice,
                ...(quantity !== undefined ? { totalQuantity: quantity } : {})
            }
        });

        // Notify search sync
        const concert = await this.concertRepo.findById(concertId);
        if (concert) {
            const concertAggregate = this.publisher.mergeObjectContext(concert);
            concertAggregate.updateTicketPrice();
            concertAggregate.commit();
        }
    }
}
