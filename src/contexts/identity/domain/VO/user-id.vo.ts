import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class UserId extends UniqueEntityID {
    private constructor(id: number) {
        super(id);
    }

    private _type = 'UserId';

    static create(id: number): UserId {
        return new UserId(id);
    }

    getNumber(): number {
        return this.getValue() as number;
    }
}
