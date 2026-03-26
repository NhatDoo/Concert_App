import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { InitiatePaymentCommand } from '../initiate-payment.command';
import { IINVOICE_REPOSITORY } from '../../../domain/repository/invoice.repository.interface';
import type { IInvoiceRepository } from '../../../domain/repository/invoice.repository.interface';
import { IPAYMENT_REPOSITORY } from '../../../domain/repository/payment.repository.interface';
import type { IPaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { IPAYMENT_GATEWAY } from '../../../domain/service/payment-gateway.interface';
import type { IPaymentGateway } from '../../../domain/service/payment-gateway.interface';
import { Payment, PaymentMethod } from '../../../domain/entity/payment.entity';
import { InvoiceStatus } from '../../../domain/aggregate/invoice.aggregate';

@CommandHandler(InitiatePaymentCommand)
export class InitiatePaymentHandler implements ICommandHandler<InitiatePaymentCommand> {
    constructor(
        @Inject(IINVOICE_REPOSITORY) private readonly invoiceRepo: IInvoiceRepository,
        @Inject(IPAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
        @Inject(IPAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
    ) { }

    async execute(command: InitiatePaymentCommand): Promise<string> {
        const { invoiceId, method, ipAddress, returnUrl } = command;

        // 1. Validate the invoice
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new NotFoundException(`Invoice ${invoiceId} not found`);
        }
        if (invoice.status !== InvoiceStatus.ISSUED) {
            throw new BadRequestException('Only ISSUED invoices can be paid');
        }

        // 2. Create a Payment entity
        const paymentId = uuidv4();
        const totalAmount = invoice.getTotalAmount();
        const paymentMethod = method as PaymentMethod;
        const payment = Payment.create(paymentId, invoiceId, invoice.bookingId, totalAmount, paymentMethod);

        // 3. Save the payment
        await this.paymentRepo.save(payment);

        // 4. Generate payment URL via gateway
        const paymentUrl = await this.paymentGateway.generatePaymentUrl({
            orderId: paymentId,
            amount: totalAmount,
            orderInfo: `Payment for Invoice ${invoiceId}`,
            ipAddress,
            returnUrl,
        });

        console.log(`Payment ${paymentId} initiated for Invoice ${invoiceId}`);
        return paymentUrl;
    }
}
