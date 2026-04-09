export enum EventRequirementStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export class EventRequirement {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string | null,
        public readonly authorId: string,
        public readonly vendorId: string | null,
        public readonly staffNeeded: number,
        public readonly equipmentNeeded: number,
        public readonly budgetAllocated: number,
        public status: EventRequirementStatus = EventRequirementStatus.PENDING,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) { }

    static create(
        id: string,
        title: string,
        description: string | null,
        authorId: string,
        vendorId: string | null,
        staffNeeded: number,
        equipmentNeeded: number,
        budgetAllocated: number
    ): EventRequirement {
        return new EventRequirement(
            id,
            title,
            description,
            authorId,
            vendorId,
            staffNeeded,
            equipmentNeeded,
            budgetAllocated,
            EventRequirementStatus.PENDING,
            new Date(),
            new Date()
        );
    }

    accept(): void {
        this.status = EventRequirementStatus.ACCEPTED;
    }

    reject(): void {
        this.status = EventRequirementStatus.REJECTED;
    }
}
