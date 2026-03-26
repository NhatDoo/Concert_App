import { StaffTaskStatus } from '../../domain/entity/staff-task.entity';

export class AssignStaffTaskCommand {
    constructor(
        public readonly concertId: string,
        public readonly staffId: string,
        public readonly description: string
    ) { }
}

export class UpdateStaffTaskCommand {
    constructor(
        public readonly concertId: string,
        public readonly staffId: string,
        public readonly taskId: string,
        public readonly status: StaffTaskStatus
    ) { }
}
