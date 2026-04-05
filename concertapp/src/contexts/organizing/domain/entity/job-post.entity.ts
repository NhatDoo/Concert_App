export class JobPost {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly requirements: string,
        public readonly status: 'OPEN' | 'CLOSED',
        public readonly companyName: string,
        public readonly companyLogo: string,
        public readonly location: string,
        public readonly salary: string,
        public readonly organizerId: string,
        public readonly authorId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly author?: { name: string; role: string }
    ) { }

    static create(
        id: string,
        title: string,
        description: string,
        requirements: string,
        organizerId: string,
        authorId: string,
        options?: {
            companyName?: string,
            companyLogo?: string,
            location?: string,
            salary?: string
        }
    ): JobPost {
        return new JobPost(
            id,
            title,
            description,
            requirements,
            'OPEN',
            options?.companyName || '',
            options?.companyLogo || '',
            options?.location || '',
            options?.salary || '',
            organizerId,
            authorId,
            new Date(),
            new Date()
        );
    }
}
