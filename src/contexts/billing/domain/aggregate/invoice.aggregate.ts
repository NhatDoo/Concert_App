import { InvoiceItem } from "../VO/invode.vo";
import { ITaxPolicy } from "../policy/tax.policy";
import { Money } from "../../../../common/domain/value-object/money.vo";


export enum InvoiceStatus {
    DRAFT = "DRAFT",
    ISSUED = "ISSUED",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}

export class InvoiceAggregate {
    id: string;
    bookingId: string;
    userId: string;
    items: InvoiceItem[];    // Danh sách dòng tiền
    taxAmount: Money;
    discountAmount: Money;
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    paymentId?: string;

    constructor(
        id: string,
        bookingId: string,
        userId: string,
        discountAmount: Money,
        issueDate: Date,
        dueDate: Date
    ) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.items = [];
        this.taxAmount = Money.create(0); // Khởi tạo bằng 0 khi còn là DRAFT
        this.discountAmount = discountAmount;
        this.status = InvoiceStatus.DRAFT;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
    }

    static create(id: string, bookingId: string, userId: string, dueDate: Date, discountAmount?: Money): InvoiceAggregate {
        if (!bookingId) throw new Error("Booking Id is required to generate an invoice");
        if (!userId) throw new Error("User Id is required to generate an invoice");

        const issueDate = new Date();
        if (dueDate <= issueDate) throw new Error("Due date must be in the future");

        return new InvoiceAggregate(id, bookingId, userId, discountAmount || Money.create(0), issueDate, dueDate);
    }

    addItem(item: InvoiceItem): void {
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new Error("Cannot add items to an invoice that is already issued or paid");
        }
        this.items.push(item);
    }

    removeItem(itemToRemove: InvoiceItem): void {
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new Error("Cannot remove items from an invoice that is already issued or paid");
        }
        this.items = this.items.filter(item => !item.equals(itemToRemove));
    }

    // Tính tổng tiền chưa thuế (Tổng cộng các items)
    getSubtotal(): Money {
        return this.items.reduce((sum, item) => sum.add(item.total), Money.create(0));
    }


    getTaxAmount(): Money {
        return this.taxAmount;
    }


    getTotalAmount(): Money {
        const subtotal = this.getSubtotal();
        const tax = this.getTaxAmount();
        const totalBeforeDiscount = subtotal.add(tax);
        try {
            return totalBeforeDiscount.subtract(this.discountAmount);
        } catch (e) {
            return Money.create(0);
        }
    }

    issueInvoice(taxPolicy: ITaxPolicy): void {
        if (this.items.length === 0) {
            throw new Error("Cannot issue an invoice without any items");
        }
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new Error("Only draft invoices can be issued");
        }
        // Gọi Policy được truyền từ ngoài vào để đánh giá và chốt thuế
        this.taxAmount = taxPolicy.calculateTax(this.items);
        this.status = InvoiceStatus.ISSUED;
    }

    markAsPaid(paymentId: string): void {
        if (this.status !== InvoiceStatus.ISSUED) {
            throw new Error("Only ISSUED invoices can be marked as paid");
        }
        this.status = InvoiceStatus.PAID;
        this.paymentId = paymentId;
    }

    cancelInvoice(): void {
        if (this.status === InvoiceStatus.PAID) {
            throw new Error("Cannot cancel a PAID invoice. Do a refund on the payment instead.");
        }
        this.status = InvoiceStatus.CANCELLED;
    }
}
