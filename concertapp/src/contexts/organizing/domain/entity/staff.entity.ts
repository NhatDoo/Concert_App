import { StaffRole } from "../VO/staff.role";
import { StaffTask } from "./staff-task.entity";

export class Staff {
    id: string;
    userId: string;
    name: string;
    role: StaffRole;
    concertId: string;
    private tasks: StaffTask[];

    constructor(id: string, userId: string, name: string, role: StaffRole, concertId: string, tasks: StaffTask[] = []) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.concertId = concertId;
        this.tasks = tasks;
    }

    static create(id: string, userId: string, name: string, role: StaffRole, concertId: string): Staff {
        if (!userId) throw new Error("User ID is required for a Staff member");
        if (!name) throw new Error("Staff name is required");
        if (!role) throw new Error("Staff Role is required");
        if (!concertId) throw new Error("Concert ID is required for a Staff member");

        return new Staff(id, userId, name, role, concertId, []);
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

    getTasks(): StaffTask[] {
        return this.tasks;
    }

    addTask(task: StaffTask): void {
        this.tasks.push(task);
    }

    updateTaskStatus(taskId: string, status: any): void {
        const task = this.tasks.find(t => t.getId() === taskId);
        if (!task) throw new Error("Task not found for this staff member");
        task.updateStatus(status);
    }
}
