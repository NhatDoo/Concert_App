import { Artist } from "./artist.entity";

export class Performance {
    id: number;
    concertId: number;
    artist: Artist | number; // Có thể lưu object Artist hoặc chỉ ID của Artist
    name: string;            
    durationMinutes: number; 
    startTime: Date;         

    constructor(id: number, concertId: number, artist: Artist | number, name: string, durationMinutes: number, startTime: Date) {
        this.id = id;
        this.concertId = concertId;
        this.artist = artist;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.startTime = startTime;
    }

    static create(id: number, concertId: number, artist: Artist | number, name: string, durationMinutes: number, startTime: Date): Performance {
        if (!name) throw new Error("Performance name is required");
        if (durationMinutes <= 0) throw new Error("Duration must be greater than 0");
        return new Performance(id, concertId, artist, name, durationMinutes, startTime);
    }

    getId(): number {
        return this.id;
    }

    getConcertId(): number {
        return this.concertId;
    }

    getArtist(): Artist | number {
        return this.artist;
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
