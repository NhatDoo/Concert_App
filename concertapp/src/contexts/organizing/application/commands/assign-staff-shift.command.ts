export class AssignStaffToShiftCommand {
    constructor(
        public readonly concertId: string,
        public readonly shiftId: string,
        public readonly staffId: string
    ) { }
}
