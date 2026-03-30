import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { BookingCreatedEvent } from '../../../../booking/domain/events/booking-created.event';
import { CreateInvoiceCommand } from '../../commands/create-invoice.command';
import { IssueInvoiceCommand } from '../../commands/issue-invoice.command';
import { PrismaService } from '../../../../../prisma.service';

@EventsHandler(BookingCreatedEvent)
export class BookingCreatedEventHandler implements IEventHandler<BookingCreatedEvent> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly prisma: PrismaService,
    ) { }

    async handle(event: BookingCreatedEvent) {
        console.log(`[Billing] Received BookingCreatedEvent for booking [${event.bookingId}]. Generating invoice...`);

        // Fetch tickets for this booking to generate line items
        const tickets = await this.prisma.ticket.findMany({
            where: { bookingId: event.bookingId }
        });

        // Group tickets by type
        const itemMap = new Map<string, { quantity: number, unitPrice: number }>();
        for (const t of tickets) {
            const current = itemMap.get(t.ticketType);
            if (current) {
                current.quantity += 1;
            } else {
                itemMap.set(t.ticketType, { quantity: 1, unitPrice: t.price });
            }
        }

        const items = Array.from(itemMap.entries()).map(([type, data]) => ({
            description: `Vé ${type}`,
            quantity: data.quantity,
            unitPrice: data.unitPrice
        }));

        // Due date: typically 1 hour/day after booking, we will set it to 1 day for simplicity
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);

        const createInvoiceCommand = new CreateInvoiceCommand(
            event.bookingId,
            event.userId,
            items,
            dueDate,
            0 // discountAmount
        );

        // 1. Create Invoice
        const invoiceId = await this.commandBus.execute(createInvoiceCommand);

        // 2. Automatically Issue Invoice so it can be paid immediately
        const issueInvoiceCommand = new IssueInvoiceCommand(invoiceId);
        await this.commandBus.execute(issueInvoiceCommand);

        console.log(`[Billing] Automated Invoice ${invoiceId} created and issued for booking ${event.bookingId}`);
    }
}
