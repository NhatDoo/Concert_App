import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateTicketsCommand } from '../generate-tickets.command';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(GenerateTicketsCommand)
export class GenerateTicketsHandler implements ICommandHandler<GenerateTicketsCommand, void> {
    constructor(private readonly prisma: PrismaService) { }

    async execute(command: GenerateTicketsCommand): Promise<void> {
        const { concertId, ticketTypes } = command;

        for (const type of ticketTypes) {
            
            await this.prisma.ticketPool.upsert({
                where: {
                    concertId_ticketType: {
                        concertId,
                        ticketType: type.type.getValue()
                    }
                },
                update: {
                    price: type.price.getAmount(),
                    totalQuantity: { increment: type.quantity }
                },
                create: {
                    concertId,
                    ticketType: type.type.getValue(),
                    price: type.price.getAmount(),
                    totalQuantity: type.quantity,
                    soldCount: 0
                }
            });
        }
    }
}
