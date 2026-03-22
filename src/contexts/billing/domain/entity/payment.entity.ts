export enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    E_WALLET = "E_WALLET",   // Momo, ZaloPay, v.v.
    CASH = "CASH"
}

export enum PaymentStatus {
    PENDING = "PENDING",     // Đang chờ thanh toán
    SUCCESS = "SUCCESS",     // Toán hoàn tất
    FAILED = "FAILED",       // Thanh toán thất bại
    REFUNDED = "REFUNDED"    // Đã hoàn tiền
}

export class Payment {
    id: number;
    bookingId: number;       // Thanh toán cho một giao dịch Booking cụ thể
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;  // Mã giao dịch từ bên phía Third-Party (VnPay, Momo)
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        bookingId: number,
        amount: number,
        method: PaymentMethod,
        status: PaymentStatus,
        createdAt: Date,
        updatedAt: Date,
        transactionId?: string
    ) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.transactionId = transactionId;
    }

    static create(id: number, bookingId: number, amount: number, method: PaymentMethod): Payment {
        if (!bookingId) throw new Error("Booking ID is required for a Payment");
        if (amount < 0) throw new Error("Payment amount cannot be negative");

        const now = new Date();
        return new Payment(id, bookingId, amount, method, PaymentStatus.PENDING, now, now);
    }

    markAsSuccess(transactionId: string): void {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error("Only pending payments can be marked as success");
        }
        this.status = PaymentStatus.SUCCESS;
        this.transactionId = transactionId;
        this.updatedAt = new Date();
    }

    markAsFailed(): void {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error("Only pending payments can be marked as failed");
        }
        this.status = PaymentStatus.FAILED;
        this.updatedAt = new Date();
    }

    refund(): void {
        if (this.status !== PaymentStatus.SUCCESS) {
            throw new Error("Only successful payments can be refunded");
        }
        this.status = PaymentStatus.REFUNDED;
        this.updatedAt = new Date();
    }
}
