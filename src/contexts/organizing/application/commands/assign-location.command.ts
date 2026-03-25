export class AssignLocationCommand {
    constructor(
        public readonly concertId: string,
        public readonly locationName: string,
        public readonly address: string,
        public readonly capacity: number
    ) { }
}
