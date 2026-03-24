import { DomainException } from "../../../../common/domain/exception/domain.exception";

export class InvalidBookingStateException extends DomainException {
    constructor(action: string, currentState: string) {
        super(`Cannot perform '${action}' on booking in state '${currentState}'.`);
    }
}
