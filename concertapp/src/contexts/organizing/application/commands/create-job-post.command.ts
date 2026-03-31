export class CreateJobPostCommand {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly requirements: string,
        public readonly companyName: string,
        public readonly companyLogo: string,
        public readonly location: string,
        public readonly salary: string,
        public readonly organizerId: string,
        public readonly authorId: string
    ) { }
}
