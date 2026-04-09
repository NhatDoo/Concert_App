export class ShiftAssignment {
    constructor(
        public readonly id: string,
        public readonly shiftId: string,
        public readonly staffId: string,
        public status: string = 'ASSIGNED',
        public checkIn: Date | null = null,
        public checkOut: Date | null = null
    ) { }

    static create(id: string, shiftId: string, staffId: string): ShiftAssignment {
        return new ShiftAssignment(id, shiftId, staffId, 'ASSIGNED', null, null);
    }

    performCheckIn(time: Date = new Date()): void {
        this.checkIn = time;
        this.status = 'CHECKED_IN';
    }

    performCheckOut(time: Date = new Date()): void {
        this.checkOut = time;
        this.status = 'COMPLETED';
    }
}
