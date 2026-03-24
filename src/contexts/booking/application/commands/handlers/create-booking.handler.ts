import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../create-booking.command';


@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {

    async execute(command: CreateBookingCommand): Promise<void> {
        const { userId, concertId, ticketIds } = command;

        console.log(`Executing CreateBookingCommand for User: ${userId}, Concert: ${concertId}`);

    }
}
