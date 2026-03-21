import { StaffRole } from "../VO/staff_vo/staff.role";

export class Staff {
    id: number;
    userId: number;       
    name: string;         
    role: StaffRole;      
    concertId: number;    

    constructor(id: number, userId: number, name: string, role: StaffRole, concertId: number) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.concertId = concertId;
    }

    static create(id: number, userId: number, name: string, role: StaffRole, concertId: number): Staff {
        if (!userId) throw new Error("User ID is required for a Staff member");
        if (!name) throw new Error("Staff name is required");
        if (!role) throw new Error("Staff Role is required");
        if (!concertId) throw new Error("Concert ID is required for a Staff member");

        return new Staff(id, userId, name, role, concertId);
    }

    getId(): number {
        return this.id;
    }

    getUserId(): number {
        return this.userId;
    }

    getName(): string {
        return this.name;
    }

    getRole(): StaffRole {
        return this.role;
    }

    getConcertId(): number {
        return this.concertId;
    }

    changeRole(newRole: StaffRole): void {
        this.role = newRole;
    }

    assignToConcert(newConcertId: number): void {
        this.concertId = newConcertId;
    }
}
