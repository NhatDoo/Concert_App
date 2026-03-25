import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { GenerateTicketsCommand } from '../generate-tickets.command';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(GenerateTicketsCommand)
export class GenerateTicketsHandler implements ICommandHandler<GenerateTicketsCommand, void> {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(command: GenerateTicketsCommand): Promise<void> {
        const { concertId, ticketTypes } = command;

        const ticketDataToInsert: any[] = [];

        for (const type of ticketTypes) {
            for (let i = 0; i < type.quantity; i++) {
                ticketDataToInsert.push({
                    id: uuidv4(),
                    concertId: concertId,
                    userId: null,   // unbooked
                    bookingId: null, // unbooked
                    ticketType: type.type.getValue(),
                    price: type.price.getAmount(),
                    version: 1
                });
            }
        }

        if (ticketDataToInsert.length > 0) {
            // Bulk insert tickets using Prisma
            await this.prisma.ticket.createMany({
                data: ticketDataToInsert
            });
        }
    }
}
