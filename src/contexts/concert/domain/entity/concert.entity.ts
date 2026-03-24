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

    private constructor(id: string, name: string, date: StartDate, location: string) {
        super();
        this.id = id;
        this.name = name;
        this.startdate = date;
        this.location = location;

    }

    static create(id: string, name: string, startdate: StartDate, location: string): Concert {
        if (!name) throw new Error("Name is required");

        const concert = new Concert(id, name, startdate, location);
        concert.apply(new ConcertCreatedEvent(id, name, startdate.getValue(), location));
        return concert;
    }

    getId(): string {
        return this.id;
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
}