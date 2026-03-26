import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmPaymentCommand } from '../confirm-payment.command';
import { IINVOICE_REPOSITORY } from '../../../domain/repository/invoice.repository.interface';
import type { IInvoiceRepository } from '../../../domain/repository/invoice.repository.interface';
import { IPAYMENT_REPOSITORY } from '../../../domain/repository/payment.repository.interface';
import type { IPaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { IPAYMENT_GATEWAY } from '../../../domain/service/payment-gateway.interface';
import type { IPaymentGateway } from '../../../domain/service/payment-gateway.interface';

@CommandHandler(ConfirmPaymentCommand)
export class ConfirmPaymentHandler implements ICommandHandler<ConfirmPaymentCommand> {
    constructor(
        @Inject(IINVOICE_REPOSITORY) private readonly invoiceRepo: IInvoiceRepository,
        @Inject(IPAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
        @Inject(IPAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
    ) { }

    async execute(command: ConfirmPaymentCommand): Promise<{ success: boolean; message: string }> {
        const { query } = command;

        // 1. Verify the payment callback with gateway
        const result = await this.paymentGateway.verifyPayment(query);

        // 2. Find the payment entity (orderId = paymentId)
        const payment = await this.paymentRepo.findById(result.orderId);
        if (!payment) {
            throw new NotFoundException(`Payment ${result.orderId} not found`);
        }

        if (result.isSuccess) {
            // 3a. Mark payment as successful
            payment.markAsSuccess(result.transactionId);
            await this.paymentRepo.save(payment);

            // 4. Find the invoice linked to this booking and mark as paid
            const invoice = await this.invoiceRepo.findByBookingId(payment.bookingId);
            if (invoice) {
                invoice.markAsPaid(payment.id);
                await this.invoiceRepo.save(invoice);
            }

            console.log(`Payment ${payment.id} confirmed successfully`);
            return { success: true, message: 'Payment confirmed successfully' };
        } else {
            // 3b. Mark payment as failed
            payment.markAsFailed();
            await this.paymentRepo.save(payment);

            console.log(`Payment ${payment.id} failed: ${result.message}`);
            return { success: false, message: result.message };
        }
    }
}
