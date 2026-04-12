import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BookingCancelledEvent } from '../../../../booking/domain/events/booking-cancelled.event';
import { PrismaService } from '../../../../../prisma.service';
import { IPAYMENT_GATEWAY } from '../../../domain/service/payment-gateway.interface';
import type { IPaymentGateway } from '../../../domain/service/payment-gateway.interface';

@EventsHandler(BookingCancelledEvent)
export class BookingCancelledEventHandler implements IEventHandler<BookingCancelledEvent> {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(IPAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
    ) { }

    async handle(event: BookingCancelledEvent) {
        console.log(`[Billing] Received BookingCancelledEvent for booking [${event.bookingId}]. Processing refund if applicable...`);

        // Tìm invoice liên quan
        const invoice = await this.prisma.invoice.findFirst({
            where: { bookingId: event.bookingId },
            include: { payments: true }
        });

        if (!invoice) return;

        // Cập nhật trạng thái Invoice thành CANCELLED
        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'CANCELLED' }
        });

        // Tìm payment thành công
        const successfulPayment = invoice.payments.find(p => p.status === 'ACCEPT' || p.status === 'SUCCESS');

        if (successfulPayment && successfulPayment.transactionId) {
            try {
                // Parse transactionId để lấy meta thông tin VNPAY
                const meta = JSON.parse(successfulPayment.transactionId);

                if (meta.vnpTxnRef && meta.vnpTransactionNo && meta.vnpPayDate) {
                    console.log(`[Billing] Initiating Refund for Payment ${successfulPayment.id} ...`);

                    const isRefunded = await this.paymentGateway.refundPayment({
                        vnpTxnRef: meta.vnpTxnRef,
                        vnpTransactionNo: meta.vnpTransactionNo,
                        vnpTransactionDate: meta.vnpPayDate,
                        amount: successfulPayment.amount,
                        createBy: 'system_auto', // Hoặc email admin
                        ipAddr: '127.0.0.1' // Server IP thực tế
                    });

                    if (isRefunded) {
                        await this.prisma.payment.update({
                            where: { id: successfulPayment.id },
                            data: { status: 'REFUNDED' }
                        });
                        console.log(`[Billing] Refund successful for Payment ${successfulPayment.id}`);
                    } else {
                        console.error(`[Billing] Refund failed at VNPAY Gateway for Payment ${successfulPayment.id}`);
                    }
                }
            } catch (e) {
                console.log(`[Billing] Payment doesn't have valid refund JSON metadata, or refund failed.`, e);
            }
        }
    }
}
