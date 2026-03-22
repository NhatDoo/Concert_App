export class Artist {
    id: number;
    name: string;
    bio: string;
    contactInfo: string;

    constructor(id: number, name: string, bio: string, contactInfo: string) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.contactInfo = contactInfo;
    }

    static create(id: number, name: string, bio: string = "", contactInfo: string = ""): Artist {
        if (!name) throw new Error("Artist name is required");
        return new Artist(id, name, bio, contactInfo);
    }

    getId(): number {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getBio(): string {
        return this.bio;
    }

    getContactInfo(): string {
        return this.contactInfo;
    }

    updateDetails(name: string, bio: string, contactInfo: string): void {
        if (name) this.name = name;
        if (bio !== undefined) this.bio = bio;
        if (contactInfo !== undefined) this.contactInfo = contactInfo;
    }
}
