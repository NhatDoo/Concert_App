import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class ConcertId extends UniqueEntityID {
    private constructor(id: string) {
        super(id);
    }

    private _type = 'ConcertId';

    static create(id: string): ConcertId {
        return new ConcertId(id);
    }

    getString(): string {
        return this.getValue() as string;
    }
}
