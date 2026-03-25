export type StaffTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export class StaffTask {
    id: string;
    description: string;
    status: StaffTaskStatus;
    staffId: string;

    constructor(id: string, description: string, status: StaffTaskStatus, staffId: string) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.staffId = staffId;
    }

    static create(id: string, description: string, staffId: string): StaffTask {
        if (!description || description.trim().length === 0) {
            throw new Error("Task description cannot be empty");
        }
        return new StaffTask(id, description, 'PENDING', staffId);
    }

    getId(): string {
        return this.id;
    }

    getDescription(): string {
        return this.description;
    }

    getStatus(): StaffTaskStatus {
        return this.status;
    }

    getStaffId(): string {
        return this.staffId;
    }

    updateStatus(newStatus: StaffTaskStatus): void {
        this.status = newStatus;
    }
}
