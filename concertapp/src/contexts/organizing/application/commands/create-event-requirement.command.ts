export class CreateEventRequirementCommand {
    constructor(
        public readonly concertId: string,
        public readonly authorId: string,
        public readonly title: string,
        public readonly description: string | null,
        public readonly staffNeeded: number,
        public readonly budgetAllocated: number,
        public readonly vendorId: string | null = null
    ) { }
}
