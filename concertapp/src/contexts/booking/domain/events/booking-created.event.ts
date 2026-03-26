export class BookingCreatedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly concertId: string,
        public readonly totalAmount: number,
    ) { }
}
