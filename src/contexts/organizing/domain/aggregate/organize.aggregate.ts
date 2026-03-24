import { AggregateRoot } from "@nestjs/cqrs";
import { Divide } from "../entity/devide.entity";
import { Location } from "../entity/location.entity";
import { Logistics, LogisticsStatus } from "../entity/logistics.entity";
import { LocationAssignedEvent } from "../events/location-assigned.event";

export class OrganizeAggregate extends AggregateRoot {
    private readonly id: string;
    private readonly concertId: string;
    private location: Location | null;
    private equipments: Divide[];
    private logistics: Logistics[];

    private constructor(id: string, concertId: string, location: Location | null = null, equipments: Divide[] = [], logistics: Logistics[] = []) {
        super();
        this.id = id;
        this.concertId = concertId;
        this.location = location;
        this.equipments = equipments;
        this.logistics = logistics;
    }

    static create(id: string, concertId: string): OrganizeAggregate {
        if (!concertId) throw new Error("Concert ID is required for organization");
        return new OrganizeAggregate(id, concertId, null, [], []);
    }

    // --- Location Management (Địa điểm) ---
    assignLocation(location: Location): void {
        this.location = location;
        // Assume location has an ID, using a dummy or fetching if exists:
        const locId = (location as any).id || 0; // Replace with proper location ID getter in production
        this.apply(new LocationAssignedEvent(this.id, this.concertId, locId));
    }

    getLocation(): Location | null {
        return this.location;
    }

    getId(): string {
        return this.id;
    }

    getConcertId(): string {
        return this.concertId;
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

    removeEquipment(equipmentId: string): void {
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

    updateLogisticsStatus(taskId: string, status: LogisticsStatus): void {
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
