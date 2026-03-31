export class TicketPriceUpdatedEvent {
    constructor(
        public readonly concertId: string,
    ) { }
}
