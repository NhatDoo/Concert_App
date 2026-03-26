import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateInvoiceCommand } from '../create-invoice.command';
import { IINVOICE_REPOSITORY } from '../../../domain/repository/invoice.repository.interface';
import type { IInvoiceRepository } from '../../../domain/repository/invoice.repository.interface';
import { InvoiceAggregate } from '../../../domain/aggregate/invoice.aggregate';
import { InvoiceItem } from '../../../domain/VO/invode.vo';
import { Money } from '../../../../../common/domain/value-object/money.vo';

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler implements ICommandHandler<CreateInvoiceCommand> {
    constructor(
        @Inject(IINVOICE_REPOSITORY) private readonly invoiceRepo: IInvoiceRepository,
        private readonly publisher: EventPublisher,
    ) { }

    async execute(command: CreateInvoiceCommand): Promise<string> {
        const { bookingId, userId, items, dueDate, discountAmount } = command;

        console.log(`Creating invoice for Booking: ${bookingId}, User: ${userId}`);

        // 1. Create the Invoice Aggregate
        const invoiceId = uuidv4();
        const discount = discountAmount ? Money.create(discountAmount) : Money.create(0);
        const invoice = InvoiceAggregate.create(invoiceId, bookingId, userId, new Date(dueDate), discount);

        // 2. Add items to the invoice
        for (const item of items) {
            const invoiceItem = new InvoiceItem(
                item.description,
                item.quantity,
                Money.create(item.unitPrice),
            );
            invoice.addItem(invoiceItem);
        }

        // 3. Save via repository
        await this.invoiceRepo.save(invoice);

        console.log(`Successfully created InvoiceID: ${invoiceId}`);
        return invoiceId;
    }
}
