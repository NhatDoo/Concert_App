import { InvoiceAggregate } from "../aggregate/invoice.aggregate";

export const IINVOICE_REPOSITORY = Symbol('IInvoiceRepository');

export interface IInvoiceRepository {
    save(invoice: InvoiceAggregate): Promise<void>;
    findById(id: string): Promise<InvoiceAggregate | null>;
    findByBookingId(bookingId: string): Promise<InvoiceAggregate | null>;
    findByUserId(userId: string): Promise<InvoiceAggregate[]>;
}
