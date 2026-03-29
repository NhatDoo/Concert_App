export class DeleteTicketTypeCommand {
    constructor(
        public readonly concertId: string,
        public readonly ticketType: string,
    ) { }
}
