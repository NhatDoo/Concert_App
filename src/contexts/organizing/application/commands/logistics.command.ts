import { LogisticsStatus } from '../../domain/entity/logistics.entity';

export class AddLogisticsTaskCommand {
    constructor(
        public readonly concertId: string,
        public readonly taskName: string,
        public readonly vendor: string,
        public readonly cost: number
    ) {}
}

export class UpdateLogisticsStatusCommand {
    constructor(
        public readonly concertId: string,
        public readonly taskId: string,
        public readonly status: LogisticsStatus
    ) {}
}
