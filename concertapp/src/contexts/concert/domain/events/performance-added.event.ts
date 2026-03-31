export class PerformanceAddedEvent {
    constructor(
        public readonly concertId: string,
        public readonly performanceName: string,
    ) { }
}
