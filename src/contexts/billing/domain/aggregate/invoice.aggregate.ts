import { InvoiceItem } from "../VO/invode.vo";
import { ITaxPolicy } from "../policy/tax.policy";

export enum InvoiceStatus {
    DRAFT = "DRAFT",         // Bản nháp (chưa chốt)
    ISSUED = "ISSUED",       // Đã xuất/phát hành (chờ người dùng thanh toán)
    PAID = "PAID",           // Đã thanh toán (thành công)
    CANCELLED = "CANCELLED"  // Bị hủy
}


// Aggregate Root bao trọn toàn bộ khái niệm "Hóa đơn"
export class InvoiceAggregate {
    id: number;
    bookingId: number;       
    userId: number;          
    items: InvoiceItem[];    // Danh sách dòng tiền
    taxAmount: number;      
    discountAmount: number; 
    status: InvoiceStatus;
    issueDate: Date;         
    dueDate: Date;           
    paymentId?: number;

    constructor(
        id: number,
        bookingId: number,
        userId: number,
        discountAmount: number = 0,
        issueDate: Date,
        dueDate: Date
    ) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.items = [];
        this.taxAmount = 0; // Khởi tạo bằng 0 khi còn là DRAFT
        this.discountAmount = discountAmount;
        this.status = InvoiceStatus.DRAFT;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
    }

    // Factory method tạo mới Hóa đơn
    static create(id: number, bookingId: number, userId: number, dueDate: Date, discountAmount: number = 0): InvoiceAggregate {
        if (!bookingId) throw new Error("Booking Id is required to generate an invoice");
        if (!userId) throw new Error("User Id is required to generate an invoice");

        const issueDate = new Date();
        if (dueDate <= issueDate) throw new Error("Due date must be in the future");

        return new InvoiceAggregate(id, bookingId, userId, discountAmount, issueDate, dueDate);
    }

    addItem(item: InvoiceItem): void {
        // Business Rule: Chỉ được thay đổi hóa đơn nếu đang ở trạng thái DRAFT
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new Error("Cannot add items to an invoice that is already issued or paid");
        }
        this.items.push(item);
    }

    removeItem(itemToRemove: InvoiceItem): void {
        // Business Rule: Chỉ được thay đổi hóa đơn nếu đang ở trạng thái DRAFT
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new Error("Cannot remove items from an invoice that is already issued or paid");
        }
        this.items = this.items.filter(item => !item.equals(itemToRemove));
    }

    // Tính tổng tiền chưa thuế (Tổng cộng các items)
    getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    
    getTaxAmount(): number {
        return this.taxAmount;
    }

    
    getTotalAmount(): number {
        const total = this.getSubtotal() + this.getTaxAmount() - this.discountAmount;
        return total > 0 ? total : 0;
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

    markAsPaid(paymentId: number): void {
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
