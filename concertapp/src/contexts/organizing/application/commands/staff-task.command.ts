import { StaffTaskStatus } from '../../domain/entity/staff-task.entity';

export class AssignStaffTaskCommand {
    constructor(
        public readonly concertId: string,
        public readonly staffId: string,
        public readonly managerId: string,
        public readonly taskName: string,
        public readonly description: string,
        public readonly dueDate: Date
    ) { }
}

export class UpdateStaffTaskCommand {
    constructor(
        public readonly concertId: string,
        public readonly staffId: string,
        public readonly taskId: string,
        public readonly status: string
    ) { }
}
