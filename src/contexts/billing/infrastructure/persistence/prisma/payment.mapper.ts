import { Payment, PaymentMethod, PaymentStatus } from '../../../domain/entity/payment.entity';
import { Money } from '../../../../../common/domain/value-object/money.vo';

export class PaymentMapper {
    static toDomain(raw: any): Payment {
        return new Payment(
            raw.id,
            raw.invoiceId,
            raw.bookingId,
            Money.create(Math.round(raw.amount)),
            raw.method as PaymentMethod,
            raw.status as PaymentStatus,
            new Date(raw.createdAt),
            new Date(raw.updatedAt),
            raw.transactionId || undefined,
        );
    }

    static toPersistence(payment: Payment) {
        return {
            id: payment.id,
            invoiceId: payment.invoiceId,
            bookingId: payment.bookingId,
            amount: payment.amount.getAmount(),
            method: payment.method,
            status: payment.status,
            transactionId: payment.transactionId || null,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
}
