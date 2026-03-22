export class CreateBookingCommand {
    constructor(
        public readonly userId: number,
        public readonly concertId: number,
        public readonly ticketIds: number[]
    ) { }
}
