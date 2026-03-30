import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateTicketsCommand } from '../generate-tickets.command';
import { PrismaService } from '../../../../../prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@CommandHandler(GenerateTicketsCommand)
export class GenerateTicketsHandler implements ICommandHandler<GenerateTicketsCommand, void> {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

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

        // Invalidate Redis Cache
        const cacheKey = `concert:${concertId}:v2`;
        await this.redisService.del(cacheKey);
        console.log(`[Cache] Cleared for concert ${concertId}`);
    }
}
