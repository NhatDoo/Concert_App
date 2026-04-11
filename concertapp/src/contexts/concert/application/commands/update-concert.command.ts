export class UpdateConcertCommand {
    constructor(
        public readonly concertId: string,
        public readonly organizerId: string, // To verify ownership
        public readonly name?: string,
        public readonly startDate?: Date,
        public readonly location?: string,
        public readonly imageFile?: Express.Multer.File,
        public readonly seatMapFile?: Express.Multer.File,
        public readonly seats?: Array<{ label: string; ticketType: string; price: number }>,
        public readonly categories?: string[],
        public readonly hashtags?: string[],
    ) { }
}
