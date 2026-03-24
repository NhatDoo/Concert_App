import { UniqueEntityID } from "../../../../common/domain/value-object/unique-entity-id.vo";

export class UserId extends UniqueEntityID {
    private constructor(id: string) {
        super(id);
    }

    static create(id: string): UserId {
        return new UserId(id);
    }

    getString(): string {
        return this.getValue() as string;
    }
}
