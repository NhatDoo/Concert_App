export class CreateBookingCommand {
    constructor(
        public readonly userId: string,
        public readonly concertId: string,
        public readonly seatIds?: string[],
        public readonly ticketGroups?: Array<{ ticketType: string, quantity: number }>
    ) { }
}
