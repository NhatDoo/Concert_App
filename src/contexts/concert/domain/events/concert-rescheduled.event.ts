export class ConcertRescheduledEvent {
    constructor(
        public readonly concertId: string,
        public readonly newDate: Date,
    ) { }
}
