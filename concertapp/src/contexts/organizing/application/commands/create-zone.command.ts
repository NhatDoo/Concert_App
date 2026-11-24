export class CreateZoneCommand {
    constructor(
        public readonly concertId: string,
        public readonly name: string,
        public readonly description: string | null = null,
        public readonly capacity: number | null = null,
        public readonly mapX = 50,
        public readonly mapY = 50
    ) { }
}
