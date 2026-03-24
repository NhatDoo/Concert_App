import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class BookingId extends UniqueEntityID {
    private constructor(id: string) {
        super(id);
    }

    // For TypeScript to correctly distinguish types
    private _type = 'BookingId';

    static create(id: string): BookingId {
        return new BookingId(id);
    }

    getString(): string {
        return this.getValue() as string;
    }
}
