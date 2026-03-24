import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class BookingId extends UniqueEntityID {
    private constructor(id: number) {
        super(id);
    }

    // For TypeScript to correctly distinguish types
    private _type = 'BookingId';

    static create(id: number): BookingId {
        return new BookingId(id);
    }

    getNumber(): number {
        return this.getValue() as number;
    }
}
