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
        public readonly concertId: string | null,
        public readonly authorStaffId: string | null,
        public readonly authorUserId: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly category: string = 'STAFF',
        public readonly authorStaff?: { name: string; role: string; user?: { email: string; phoneNumber: string } },
        public readonly authorUser?: { name: string; email: string }
    ) { }

    static create(
        id: string,
        title: string,
        description: string,
        requirements: string,
        authors: { authorStaffId?: string; authorUserId?: string; concertId?: string },
        options?: {
            companyName?: string,
            companyLogo?: string,
            location?: string,
            salary?: string,
            category?: string
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
            authors.concertId || null,
            authors.authorStaffId || null,
            authors.authorUserId || null,
            new Date(),
            new Date(),
            options?.category || 'STAFF'
        );
    }
}
