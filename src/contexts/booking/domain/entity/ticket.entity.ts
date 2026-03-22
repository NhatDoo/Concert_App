import { Tickettype } from "../VO/tickettype.vo"

export class Ticket {
    id: number
    concertId: number
    userId: number
    ticketType: Tickettype
    price: number   

    constructor(id: number, concertId: number, userId: number, price: number , ticketType: Tickettype) {
        this.id = id;
        this.concertId = concertId;     
        this.userId = userId;
        this.price = price;
        this.ticketType = ticketType;
    }
    static create(id: number, concertId: number, userId: number, price: number , ticket:Tickettype): Ticket {
        return new Ticket(id, concertId, userId, price , ticket);
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
    setTicketType(ticketType: Tickettype): void {
        this.ticketType = ticketType;
    }
    setPrice(price: number): void {
        this.price = price;
    }
}