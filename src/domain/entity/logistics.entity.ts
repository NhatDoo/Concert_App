export type LogisticsStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export class Logistics {
    id: number;
    taskName: string;
    vendor: string;
    cost: number;
    status: LogisticsStatus;

    constructor(id: number, taskName: string, vendor: string, cost: number, status: LogisticsStatus) {
        this.id = id;
        this.taskName = taskName;
        this.vendor = vendor;
        this.cost = cost;
        this.status = status;
    }

    static create(id: number, taskName: string, vendor: string, cost: number): Logistics {
        if (!taskName) throw new Error("Task name is required");
        return new Logistics(id, taskName, vendor, cost, 'PENDING');
    }

    updateStatus(newStatus: LogisticsStatus): void {
        this.status = newStatus;
    }

    updateCost(newCost: number): void {
        if (newCost < 0) throw new Error("Cost cannot be negative");
        this.cost = newCost;
    }
}
