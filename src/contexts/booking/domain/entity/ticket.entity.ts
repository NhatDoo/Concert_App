import { Tickettype } from "../VO/tickettype.vo"

export class Ticket {
    private readonly id: number;
    private readonly concertId: number;
    private readonly userId: number;
    private ticketType: Tickettype;
    private price: number;

    private constructor(id: number, concertId: number, userId: number, price: number, ticketType: Tickettype) {
        if (price < 0) throw new Error("Ticket price cannot be negative");
        this.id = id;
        this.concertId = concertId;
        this.userId = userId;
        this.price = price;
        this.ticketType = ticketType;
    }

    static create(id: number, concertId: number, userId: number, price: number, ticket: Tickettype): Ticket {
        return new Ticket(id, concertId, userId, price, ticket);
    }

    getId(): number {
        return this.id;
    }
    getConcertId(): number {
        return this.concertId;
    }
    getTicketType(): Tickettype {
        return this.ticketType;
    }
    getUserId(): number {
        return this.userId;
    }
    getPrice(): number {
        return this.price;
    }

    /**
     * Domain Behavior: Change the ticket type (e.g. Upgrade to VIP)
     */
    upgradeTicketType(newType: Tickettype, additionalCost: number): void {
        if (additionalCost < 0) throw new Error("Additional cost cannot be negative");
        this.ticketType = newType;
        this.price += additionalCost;
    }

    /**
     * Domain Behavior: Apply discount to the ticket
     */
    applyDiscount(discountAmount: number): void {
        if (discountAmount <= 0) throw new Error("Discount must be greater than 0");
        if (this.price - discountAmount < 0) throw new Error("Price cannot be less than 0 after discount");
        this.price -= discountAmount;
    }
}