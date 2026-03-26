export class InvoicePaidEvent {
    constructor(
        public readonly invoiceId: string,
        public readonly paymentId: string,
    ) { }
}
