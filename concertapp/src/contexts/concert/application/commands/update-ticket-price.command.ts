export class UpdateTicketPriceCommand {
    constructor(
        public readonly concertId: string,
        public readonly ticketType: string,
        public readonly newPrice: number,
        public readonly quantity?: number,
    ) { }
}
