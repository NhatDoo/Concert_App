export class CreateConcertCommand {
    constructor(
        public readonly organizerId: string,
        public readonly name: string,
        public readonly startDate: Date,
        public readonly location: string,
        public readonly imageFile?: Express.Multer.File,
        public readonly categories?: string[],
        public readonly hashtags?: string[],
    ) { }
}
