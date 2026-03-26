import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IssueInvoiceCommand } from '../issue-invoice.command';
import { IINVOICE_REPOSITORY } from '../../../domain/repository/invoice.repository.interface';
import type { IInvoiceRepository } from '../../../domain/repository/invoice.repository.interface';
import { VAT10TaxPolicy } from '../../../domain/policy/tax.policy';

@CommandHandler(IssueInvoiceCommand)
export class IssueInvoiceHandler implements ICommandHandler<IssueInvoiceCommand> {
    constructor(
        @Inject(IINVOICE_REPOSITORY) private readonly invoiceRepo: IInvoiceRepository,
    ) { }

    async execute(command: IssueInvoiceCommand): Promise<void> {
        const { invoiceId } = command;

        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new NotFoundException(`Invoice ${invoiceId} not found`);
        }

        // Use default VAT 10% tax policy — can be swapped via DI or strategy pattern
        const taxPolicy = new VAT10TaxPolicy();
        invoice.issueInvoice(taxPolicy);

        await this.invoiceRepo.save(invoice);

        console.log(`Invoice ${invoiceId} has been issued`);
    }
}
