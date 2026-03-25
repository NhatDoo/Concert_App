import { Artist } from "./artist.entity";

export class Performance {
    id: string;
    concertId: string;
    artist: Artist | string; // Có thể lưu object Artist hoặc chỉ ID (artistId)
    name: string;
    durationMinutes: number;
    startTime: Date;

    constructor(id: string, concertId: string, artist: Artist | string, name: string, durationMinutes: number, startTime: Date) {
        this.id = id;
        this.concertId = concertId;
        this.artist = artist;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.startTime = startTime;
    }

    static create(id: string, concertId: string, artist: Artist | string, name: string, durationMinutes: number, startTime: Date): Performance {
        if (!name) throw new Error("Performance name is required");
        if (durationMinutes <= 0) throw new Error("Duration must be greater than 0");
        return new Performance(id, concertId, artist, name, durationMinutes, startTime);
    }

    getId(): string {
        return this.id;
    }

    getConcertId(): string {
        return this.concertId;
    }

    getArtist(): Artist | string {
        return this.artist;
    }

    getArtistId(): string {
        if (typeof this.artist === 'string') return this.artist;
        return this.artist.getId();
    }

    getName(): string {
        return this.name;
    }

    getDuration(): number {
        return this.durationMinutes;
    }

    getStartTime(): Date {
        return this.startTime;
    }

    updateSchedule(startTime: Date, durationMinutes: number): void {
        this.startTime = startTime;
        if (durationMinutes > 0) {
            this.durationMinutes = durationMinutes;
        }
    }
}
