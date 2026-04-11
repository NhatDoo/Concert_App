export class CreateJobPostCommand {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly requirements: string,
        public readonly companyName: string,
        public readonly companyLogo: string,
        public readonly location: string,
        public readonly salary: string,
        public readonly concertId?: string,
        public readonly authorStaffId?: string,
        public readonly authorUserId?: string,
        public readonly category?: string
    ) { }
}
