export class ConcertRescheduledEvent {
    constructor(
        public readonly concertId: number,
        public readonly newDate: Date,
    ) { }
}
