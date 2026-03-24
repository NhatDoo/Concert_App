import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class ConcertId extends UniqueEntityID {
    private constructor(id: number) {
        super(id);
    }

    private _type = 'ConcertId';

    static create(id: number): ConcertId {
        return new ConcertId(id);
    }

    getNumber(): number {
        return this.getValue() as number;
    }
}
