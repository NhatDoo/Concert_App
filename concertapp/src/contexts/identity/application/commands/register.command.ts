export class RegisterCommand {
    constructor(
        public readonly name: string,
        public readonly phoneNumber: string,
        public readonly email: string,
        public readonly plainPassword: string,
        public readonly role: string,
        public readonly companyName?: string, // chỉ role VENDOR
        public readonly staffRole?: string, // chỉ role STAFF

    ) { }
}
