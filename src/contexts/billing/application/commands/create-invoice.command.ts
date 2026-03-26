export class CreateInvoiceCommand {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly items: { description: string; quantity: number; unitPrice: number }[],
        public readonly dueDate: Date,
        public readonly discountAmount?: number,
    ) { }
}
