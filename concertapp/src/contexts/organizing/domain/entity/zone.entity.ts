import { Shift } from './shift.entity';

export class Zone {
    private shifts: Shift[] = [];

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string | null,
        public readonly capacity: number | null,
        shifts: Shift[] = []
    ) {
        this.shifts = shifts;
    }

    static create(id: string, name: string, description: string | null = null, capacity: number | null = null): Zone {
        return new Zone(id, name, description, capacity, []);
    }

    addShift(shift: Shift): void {
        this.shifts.push(shift);
    }

    getShifts(): Shift[] {
        return this.shifts;
    }
}
