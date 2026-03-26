import { InvoiceAggregate, InvoiceStatus } from '../../../domain/aggregate/invoice.aggregate';
import { InvoiceItem } from '../../../domain/VO/invode.vo';
import { Money } from '../../../../../common/domain/value-object/money.vo';

export class InvoiceMapper {
    static toDomain(raw: any): InvoiceAggregate {
        const invoice = new InvoiceAggregate(
            raw.id,
            raw.bookingId,
            raw.userId,
            Money.create(Math.round(raw.discountAmount)),
            new Date(raw.issueDate),
            new Date(raw.dueDate),
        );

        // Restore state
        invoice.status = raw.status as InvoiceStatus;
        invoice.taxAmount = Money.create(Math.round(raw.taxAmount));
        invoice.paymentId = raw.paymentId || undefined;

        // Restore items
        if (raw.items && Array.isArray(raw.items)) {
            for (const item of raw.items) {
                const invoiceItem = new InvoiceItem(
                    item.description,
                    item.quantity,
                    Money.create(Math.round(item.unitPrice)),
                );
                invoice.items.push(invoiceItem);
            }
        }

        return invoice;
    }

    static toPersistence(invoice: InvoiceAggregate) {
        return {
            id: invoice.id,
            bookingId: invoice.bookingId,
            userId: invoice.userId,
            taxAmount: invoice.taxAmount.getAmount(),
            discountAmount: invoice.discountAmount.getAmount(),
            status: invoice.status,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            paymentId: invoice.paymentId || null,
        };
    }

    static itemsToPersistence(invoiceId: string, items: InvoiceItem[]) {
        return items.map(item => ({
            invoiceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice.getAmount(),
            total: item.total.getAmount(),
        }));
    }
}
