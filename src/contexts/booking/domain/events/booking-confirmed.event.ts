export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: number,
        public readonly totalAmount: number,
    ) { }
}
