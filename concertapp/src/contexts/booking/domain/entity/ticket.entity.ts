import { Tickettype } from "../VO/tickettype.vo"
import { Money } from "../../../../common/domain/value-object/money.vo";

export class Ticket {
    private readonly id: string;
    private readonly concertId: string;
    private readonly userId: string | null;
    private readonly seatId: string | null;
    private readonly seatLabel: string | null;
    private ticketType: Tickettype;
    private price: Money;
    private readonly isCheckedIn: boolean;

    private constructor(id: string, concertId: string, userId: string | null, price: Money, ticketType: Tickettype, seatId: string | null, seatLabel: string | null, isCheckedIn: boolean = false) {
        this.id = id;
        this.concertId = concertId;
        this.userId = userId;
        this.price = price;
        this.ticketType = ticketType;
        this.seatId = seatId;
        this.seatLabel = seatLabel;
        this.isCheckedIn = isCheckedIn;
    }

    static create(id: string, concertId: string, userId: string | null, price: Money, ticket: Tickettype, seatId: string | null = null, seatLabel: string | null = null, isCheckedIn: boolean = false): Ticket {
        return new Ticket(id, concertId, userId, price, ticket, seatId, seatLabel, isCheckedIn);
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
    getSeatId(): string | null {
        return this.seatId;
    }
    getSeatLabel(): string | null {
        return this.seatLabel;
    }
    getPrice(): Money {
        return this.price;
    }
    isChecked(): boolean {
        return this.isCheckedIn;
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
