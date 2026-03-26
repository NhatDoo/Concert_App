export class Location {
    id: string;
    name: string;
    address: string;
    capacity: number;

    constructor(id: string, name: string, address: string, capacity: number) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.capacity = capacity;
    }

    static create(id: string, name: string, address: string, capacity: number): Location {
        if (!name) throw new Error("Location name is required");
        if (!address) throw new Error("Address is required");
        return new Location(id, name, address, capacity);
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getAddress(): string {
        return this.address;
    }

    getCapacity(): number {
        return this.capacity;
    }

    updateDetails(name: string, address: string, capacity: number): void {
        if (name) this.name = name;
        if (address) this.address = address;
        if (capacity && capacity > 0) this.capacity = capacity;
    }
}
