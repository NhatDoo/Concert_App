export class LocationAssignedEvent {
    constructor(
        public readonly organizeId: string,
        public readonly concertId: string,
        public readonly locationId: string,
    ) { }
}
