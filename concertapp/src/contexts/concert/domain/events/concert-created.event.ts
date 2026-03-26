export class ConcertCreatedEvent {
    constructor(
        public readonly concertId: string,
        public readonly name: string,
        public readonly startDate: Date,
        public readonly location: string,
    ) { }
}
