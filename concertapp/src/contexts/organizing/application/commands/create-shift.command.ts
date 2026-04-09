export class CreateShiftCommand {
    constructor(
        public readonly concertId: string,
        public readonly zoneId: string,
        public readonly title: string,
        public readonly description: string | null = null,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly headcount: number,
        public readonly managerId: string | null = null
    ) { }
}
