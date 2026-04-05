export class GetJobsQuery {
    constructor(
        public readonly filters?: {
            authorId?: string;
            organizerId?: string;
            authorRole?: string;
            includeClosed?: boolean;
        }
    ) { }
}
