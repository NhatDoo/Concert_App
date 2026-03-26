export class DetailDivide {
    id: number;
    divideId: string;
    name: string;

    constructor(id: number, name: string, divideId: string) {
        this.id = id;
        this.name = name;
        this.divideId = divideId;

    }
    static create(id: number, name: string, divideId: string): DetailDivide {
        if (!name) throw new Error("Name is required");
        return new DetailDivide(id, name, divideId);
    }

    getId(): number {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    setName(name: string): void {
        this.name = name;
    }

}