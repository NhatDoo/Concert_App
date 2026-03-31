export class InviteStaffCommand {
    constructor(
        public readonly organizerId: string,
        public readonly email: string,
        public readonly role: string
    ) { }
}
