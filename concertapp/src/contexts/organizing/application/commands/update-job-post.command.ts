export class UpdateJobPostCommand {
    constructor(
        public readonly id: string,
        public readonly data: {
            title?: string;
            description?: string;
            requirements?: string;
            companyName?: string;
            companyLogo?: string;
            location?: string;
            salary?: string;
            status?: 'OPEN' | 'CLOSED';
        }
    ) { }
}
