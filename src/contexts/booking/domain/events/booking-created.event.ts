export class BookingCreatedEvent {
    constructor(
        public readonly bookingId: number,
        public readonly userId: number,
        public readonly concertId: number,
        public readonly totalAmount: number,
    ) { }
}
