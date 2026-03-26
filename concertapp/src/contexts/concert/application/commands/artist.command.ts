export class CreateArtistCommand {
    constructor(
        public readonly name: string,
        public readonly bio: string,
        public readonly contactInfo: string
    ) { }
}

export class UpdateArtistCommand {
    constructor(
        public readonly artistId: string,
        public readonly name: string,
        public readonly bio: string,
        public readonly contactInfo: string
    ) { }
}
