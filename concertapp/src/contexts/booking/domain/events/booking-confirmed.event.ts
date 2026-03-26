export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly totalAmount: number,
    ) { }
}
