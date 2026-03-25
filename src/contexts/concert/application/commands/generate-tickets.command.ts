import { Tickettype } from "../../../booking/domain/VO/tickettype.vo";
import { Money } from "../../../../common/domain/value-object/money.vo";

export class GenerateTicketsCommand {
    constructor(
        public readonly concertId: string,
        public readonly ticketTypes: { type: Tickettype; price: Money; quantity: number }[] 
    ) { }
}
