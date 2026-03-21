import { Divide } from "../entity/devide.entity";
import { Location } from "../entity/location.entity";
import { Logistics, LogisticsStatus } from "../entity/logistics.entity";

export class OrganizeAggregate {
    id: number;
    concertId: number;
    location: Location | null;
    equipments: Divide[];
    logistics: Logistics[];

    constructor(id: number, concertId: number, location: Location | null = null, equipments: Divide[] = [], logistics: Logistics[] = []) {
        this.id = id;
        this.concertId = concertId;
        this.location = location;
        this.equipments = equipments;
        this.logistics = logistics;
    }

    static create(id: number, concertId: number): OrganizeAggregate {
        if (!concertId) throw new Error("Concert ID is required for organization");
        return new OrganizeAggregate(id, concertId, null, [], []);
    }

    // --- Location Management (Địa điểm) ---
    assignLocation(location: Location): void {
        this.location = location;
    }

    getLocation(): Location | null {
        return this.location;
    }

    // --- Equipment Management (Thiết bị) ---
    addEquipment(equipment: Divide): void {
        const exists = this.equipments.find(e => e.getId() === equipment.getId());
        if (!exists) {
            this.equipments.push(equipment);
        } else {
            throw new Error("Equipment (Divide) already exists in this organization");
        }
    }

    removeEquipment(equipmentId: number): void {
        this.equipments = this.equipments.filter(e => e.getId() !== equipmentId);
    }

    getEquipments(): Divide[] {
        return this.equipments;
    }

    // --- Logistics Management (Hậu cần) ---
    addLogisticsTask(task: Logistics): void {
        const exists = this.logistics.find(l => l.id === task.id);
        if (!exists) {
            this.logistics.push(task);
        } else {
            throw new Error("Logistics task already exists in this organization");
        }
    }

    updateLogisticsStatus(taskId: number, status: LogisticsStatus): void {
        const task = this.logistics.find(l => l.id === taskId);
        if (!task) {
            throw new Error("Logistics task not found");
        }
        task.updateStatus(status);
    }

    getLogistics(): Logistics[] {
        return this.logistics;
    }

    // --- Organization Business Logic ---
    isFullyOrganized(): boolean {
        // Tổ chức hoàn tất nếu đã phân bổ địa điểm và tất cả hậu cần phải 'COMPLETED'
        if (!this.location) return false;

        if (this.logistics.length > 0) {
            const allCompleted = this.logistics.every(l => l.status === 'COMPLETED');
            if (!allCompleted) return false;
        }

        return true;
    }
}
