export class GoogleAuthCommand {
    constructor(
        public readonly email: string,
        public readonly name: string,
        public readonly googleId: string,
        public readonly picture?: string,
    ) { }
}
