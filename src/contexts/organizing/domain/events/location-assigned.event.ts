export class LocationAssignedEvent {
    constructor(
        public readonly organizeId: number,
        public readonly concertId: number,
        public readonly locationId: number,
    ) { }
}
