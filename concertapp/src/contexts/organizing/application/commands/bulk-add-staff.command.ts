export class BulkAddStaffCommand {
    constructor(
        public readonly concertId: string,
        public readonly staffMembers: Array<{ userId: string, name: string, role: string }>
    ) { }
}
