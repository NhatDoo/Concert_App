import { StartDate } from "../VO/concert_vo/startdate.vo"

export class Concert {
    id : number
    organizerId : number
    name : string
    startdate : StartDate
    location : string

    constructor(id: number, name: string, date: StartDate, location: string) {
        this.id = id;
        this.name = name;
        this.startdate = date;   
        this.location = location;
    }

    static create(id: number, name: string, startdate: StartDate, location: string): Concert {
        if (!name) throw new Error("Name is required");
        return new Concert(id, name, startdate, location);
    }

    getId(): number {
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
    setName(name: string): void {
        this.name = name;
    }
    setDate(date: StartDate): void {
        this.startdate = date;
    }
    setLocation(location: string): void {
        this.location = location;
    }
}