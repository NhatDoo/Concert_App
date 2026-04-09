import { ShiftAssignment } from './shift-assignment.entity';

export class Shift {
    private assignments: ShiftAssignment[] = [];

    constructor(
        public readonly id: string,
        public readonly managerId: string | null,
        public readonly title: string,
        public readonly description: string | null,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly headcount: number,
        assignments: ShiftAssignment[] = []
    ) {
        this.assignments = assignments;
    }

    static create(
        id: string,
        managerId: string | null,
        title: string,
        description: string | null,
        startTime: Date,
        endTime: Date,
        headcount: number
    ): Shift {
        return new Shift(id, managerId, title, description, startTime, endTime, headcount, []);
    }

    assignStaff(assignment: ShiftAssignment): void {
        this.assignments.push(assignment);
    }

    getAssignments(): ShiftAssignment[] {
        return this.assignments;
    }
}
