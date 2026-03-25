export class CreateConcertCommand {
    constructor(
        public readonly organizerId: string,
        public readonly name: string,
        public readonly startDate: Date,
        public readonly location: string
    ) { }
}
