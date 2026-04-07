export class UserRegisteredEvent {
    constructor(
        public readonly payload: {
            userId: string;
            name: string;
            email: string;
            role: string;
            companyName?: string; // chỉ role VENDOR
            staffRole?: string;   // chỉ role STAFF
        }
    ) { }
}
