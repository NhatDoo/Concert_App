export type StaffTaskStatus = 'PENDING' | 'WORKING' | 'FINISH';

export class StaffTask {
    id: string;
    taskName: string;
    description: string;
    status: StaffTaskStatus;
    staffId: string;
    managerId: string;
    dueDate: Date;

    constructor(id: string, taskName: string, description: string, status: StaffTaskStatus, staffId: string, managerId: string, dueDate: Date) {
        this.id = id;
        this.taskName = taskName;
        this.description = description;
        this.status = status;
        this.staffId = staffId;
        this.managerId = managerId;
        this.dueDate = dueDate;
    }

    static create(id: string, taskName: string, description: string, staffId: string, managerId: string, dueDate: Date): StaffTask {
        if (!taskName || taskName.trim().length === 0) {
            throw new Error("Task name cannot be empty");
        }
        return new StaffTask(id, taskName, description, 'PENDING', staffId, managerId, dueDate);
    }

    getId(): string { return this.id; }
    getTaskName(): string { return this.taskName; }
    getDescription(): string { return this.description; }
    getStatus(): StaffTaskStatus { return this.status; }
    getStaffId(): string { return this.staffId; }
    getManagerId(): string { return this.managerId; }
    getDueDate(): Date { return this.dueDate; }

    updateStatus(newStatus: StaffTaskStatus): void {
        this.status = newStatus;
    }
}
