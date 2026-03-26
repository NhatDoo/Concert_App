export class InvoiceIssuedEvent {
    constructor(
        public readonly invoiceId: string,
        public readonly totalAmount: number,
    ) { }
}
