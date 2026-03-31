export class UserRegisteredEvent {
    constructor(
        public readonly payload: {
            userId: string;
            name: string;
            email: string;
            role: string;
            staffRole?: string;
            inviteToken?: string;
        }
    ) { }
}
