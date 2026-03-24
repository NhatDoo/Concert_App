export class InvoicePaidEvent {
    constructor(
        public readonly invoiceId: number,
        public readonly paymentId: number,
    ) { }
}
