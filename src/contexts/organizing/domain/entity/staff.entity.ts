import { StaffRole } from "../VO/staff.role";

export class Staff {
    id: string;
    userId: string;
    name: string;
    role: StaffRole;
    concertId: string;

    constructor(id: string, userId: string, name: string, role: StaffRole, concertId: string) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.concertId = concertId;
    }

    static create(id: string, userId: string, name: string, role: StaffRole, concertId: string): Staff {
        if (!userId) throw new Error("User ID is required for a Staff member");
        if (!name) throw new Error("Staff name is required");
        if (!role) throw new Error("Staff Role is required");
        if (!concertId) throw new Error("Concert ID is required for a Staff member");

        return new Staff(id, userId, name, role, concertId);
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getName(): string {
        return this.name;
    }

    getRole(): StaffRole {
        return this.role;
    }

    getConcertId(): string {
        return this.concertId;
    }

    changeRole(newRole: StaffRole): void {
        this.role = newRole;
    }

    assignToConcert(newConcertId: string): void {
        this.concertId = newConcertId;
    }
}
