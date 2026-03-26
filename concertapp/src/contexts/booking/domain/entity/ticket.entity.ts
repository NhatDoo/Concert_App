import { Tickettype } from "../VO/tickettype.vo"
import { Money } from "../../../../common/domain/value-object/money.vo";

export class Ticket {
    private readonly id: string;
    private readonly concertId: string;
    private readonly userId: string | null;
    private ticketType: Tickettype;
    private price: Money;

    private constructor(id: string, concertId: string, userId: string | null, price: Money, ticketType: Tickettype) {
        this.id = id;
        this.concertId = concertId;
        this.userId = userId;
        this.price = price;
        this.ticketType = ticketType;
    }

    static create(id: string, concertId: string, userId: string | null, price: Money, ticket: Tickettype): Ticket {
        return new Ticket(id, concertId, userId, price, ticket);
    }

    getId(): string {
        return this.id;
    }
    getConcertId(): string {
        return this.concertId;
    }
    getTicketType(): Tickettype {
        return this.ticketType;
    }
    getUserId(): string | null {
        return this.userId;
    }
    getPrice(): Money {
        return this.price;
    }

    /**
     * Domain Behavior: Change the ticket type (e.g. Upgrade to VIP)
     */
    upgradeTicketType(newType: Tickettype, additionalCost: Money): void {
        this.ticketType = newType;
        this.price = this.price.add(additionalCost);
    }

    /**
     * Domain Behavior: Apply discount to the ticket
     */
    applyDiscount(discountAmount: Money): void {
        this.price = this.price.subtract(discountAmount);
    }
}