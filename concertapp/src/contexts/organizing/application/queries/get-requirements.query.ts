export class GetRequirementsQuery {
    constructor(
        public readonly filters: {
            concertId?: string;
            vendorId?: string;
            status?: string;
        }
    ) { }
}
