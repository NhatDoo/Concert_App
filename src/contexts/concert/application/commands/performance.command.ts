export class AddPerformanceCommand {
    constructor(
        public readonly concertId: string,
        public readonly artistId: string,
        public readonly name: string,
        public readonly durationMinutes: number,
        public readonly startTime: Date
    ) { }
}

export class UpdatePerformanceScheduleCommand {
    constructor(
        public readonly performanceId: string,
        public readonly startTime: Date,
        public readonly durationMinutes: number
    ) { }
}
