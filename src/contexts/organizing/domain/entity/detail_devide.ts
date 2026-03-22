export class DetailDivide {
    id: number;
    divideId: number;
    name: string;
    
    constructor(id: number, name: string , divideId: number) {
        this.id = id;
        this.name = name;
        this.divideId = divideId;
        
    }
    static create(id: number, name: string , divideId: number): DetailDivide {
        if (!name) throw new Error("Name is required");
        return new DetailDivide(id, name , divideId);
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