export enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    E_WALLET = "E_WALLET",   // Momo, ZaloPay, v.v.
    VNPAY = "VNPAY",
    CASH = "CASH"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

import { Money } from "../../../../common/domain/value-object/money.vo";

export class Payment {
    id: string;
    bookingId: string;
    amount: Money;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        bookingId: string,
        amount: Money,
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

    static create(id: string, bookingId: string, amount: Money, method: PaymentMethod): Payment {
        if (!bookingId) throw new Error("Booking ID is required for a Payment");

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
