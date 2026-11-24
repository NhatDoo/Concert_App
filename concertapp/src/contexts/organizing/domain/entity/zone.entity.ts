import { Shift } from './shift.entity';

export class Zone {
    private shifts: Shift[] = [];

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string | null,
        public readonly capacity: number | null,
        shifts: Shift[] = [],
        public readonly mapX: number = 50,
        public readonly mapY: number = 50
    ) {
        this.shifts = shifts;
    }

    static create(
        id: string,
        name: string,
        description: string | null = null,
        capacity: number | null = null,
        mapX = 50,
        mapY = 50
    ): Zone {
        return new Zone(id, name, description, capacity, [], mapX, mapY);
    }

    addShift(shift: Shift): void {
        this.shifts.push(shift);
    }

    getShifts(): Shift[] {
        return this.shifts;
    }
}
