import { AggregateRoot } from "@nestjs/cqrs";
import { StartDate } from "../VO/startdate.vo";
import { ConcertCreatedEvent } from "../events/concert-created.event";
import { ConcertRescheduledEvent } from "../events/concert-rescheduled.event";

export class Concert extends AggregateRoot {
    private readonly id: string;
    private readonly organizerId: string;
    private name: string;
    private startdate: StartDate;
    private location: string;
    private imageUrl: string | null;

    private constructor(id: string, organizerId: string, name: string, date: StartDate, location: string, imageUrl: string | null) {
        super();
        this.id = id;
        this.organizerId = organizerId;
        this.name = name;
        this.startdate = date;
        this.location = location;
        this.imageUrl = imageUrl;
    }

    static create(id: string, organizerId: string, name: string, startdate: StartDate, location: string, imageUrl: string | null = null): Concert {
        if (!name) throw new Error("Name is required");

        const concert = new Concert(id, organizerId, name, startdate, location, imageUrl);
        concert.apply(new ConcertCreatedEvent(id, name, startdate.getValue(), location));
        return concert;
    }

    static hydrate(id: string, organizerId: string, name: string, startdate: StartDate, location: string, imageUrl: string | null): Concert {
        return new Concert(id, organizerId, name, startdate, location, imageUrl);
    }

    getId(): string {
        return this.id;
    }
    getOrganizerId(): string {
        return this.organizerId;
    }
    getName(): string {
        return this.name;
    }
    getDate(): StartDate {
        return this.startdate;
    }
    getLocation(): string {
        return this.location;
    }
    getImageUrl(): string | null {
        return this.imageUrl;
    }

    // --- Domain Behaviors ---
    rename(newName: string): void {
        if (!newName) throw new Error("Name cannot be empty");
        this.name = newName;
    }

    reschedule(newDate: StartDate): void {
        this.startdate = newDate;
        this.apply(new ConcertRescheduledEvent(this.id, newDate.getValue()));
    }

    changeLocation(newLocation: string): void {
        if (!newLocation) throw new Error("Location cannot be empty");
        this.location = newLocation;
    }

    updateImageUrl(newImageUrl: string): void {
        this.imageUrl = newImageUrl;
    }
}