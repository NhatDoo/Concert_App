
export abstract class UniqueEntityID {
    constructor(private readonly value: string | number) {
        if (value === null || value === undefined) {
            throw new Error("ID value cannot be null or undefined");
        }
    }

    equals(id?: UniqueEntityID): boolean {
        if (id === null || id === undefined) {
            return false;
        }
        if (!(id instanceof this.constructor)) {
            return false;
        }
        return id.getValue() === this.value;
    }


    
    getValue(): string | number {
        return this.value;
    }

    toString(): string {
        return String(this.value);
    }
}
