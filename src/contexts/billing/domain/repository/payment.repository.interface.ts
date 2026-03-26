import { Payment } from "../entity/payment.entity";

export const IPAYMENT_REPOSITORY = Symbol('IPaymentRepository');

export interface IPaymentRepository {
    save(payment: Payment): Promise<void>;
    findById(id: string): Promise<Payment | null>;
    findByBookingId(bookingId: string): Promise<Payment[]>;
    findByInvoiceId(invoiceId: string): Promise<Payment[]>;
}
