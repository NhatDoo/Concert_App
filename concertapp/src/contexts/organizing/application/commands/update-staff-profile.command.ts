export class UpdateStaffProfileCommand {
    constructor(
        public readonly userId: string,
        public readonly name?: string,
        public readonly phoneNumber?: string,
        public readonly email?: string,
        public readonly bio?: string,
        public readonly cvUrl?: string,
    ) { }
}
