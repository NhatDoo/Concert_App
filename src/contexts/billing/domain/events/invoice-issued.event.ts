export class InvoiceIssuedEvent {
    constructor(
        public readonly invoiceId: number,
        public readonly totalAmount: number,
    ) { }
}
