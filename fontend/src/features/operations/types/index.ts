export interface EventRequirement {
    id: string;
    concertId: string;
    authorId: string;
    title: string;
    description?: string;
    staffNeeded: number;
    budgetAllocated: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    vendorId?: string;
    createdAt: string;
    concert?: {
        name: string;
        location: string;
        startDate: string;
    };
    author?: {
        name: string;
        role: string;
    };
}

export interface Zone {
    id: string;
    concertId: string;
    name: string;
    description?: string;
    capacity?: number;
    shifts?: Shift[];
}

export interface Shift {
    id: string;
    zoneId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    headcount: number;
    managerId?: string;
    assignments?: ShiftAssignment[];
}

export interface ShiftAssignment {
    id: string;
    shiftId: string;
    staffId: string;
    staff?: {
        name: string;
        role: string;
    };
}
