export class InitiatePaymentCommand {
    constructor(
        public readonly invoiceId: string,
        public readonly method: string,
        public readonly ipAddress: string,
        public readonly returnUrl: string,
    ) { }
}
