export class CreateBookingCommand {
    constructor(
        public readonly userId: string,
        public readonly concertId: string,
        public readonly items: { ticketType: string; quantity: number }[]
    ) { }
}
