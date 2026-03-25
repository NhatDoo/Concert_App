export class AddEquipmentCommand {
    constructor(
        public readonly concertId: string,
        public readonly equipmentName: string,
        public readonly details: string[]
    ) { }
}

export class AddStaffCommand {
    constructor(
        public readonly concertId: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly role: string
    ) { }
}
