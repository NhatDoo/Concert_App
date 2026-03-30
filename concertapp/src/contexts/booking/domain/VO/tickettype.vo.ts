export class Tickettype {
    constructor(public readonly value: string) { }


    static VIP = new Tickettype("VIP");
    static Regular = new Tickettype("Regular");

    static from(value: string): Tickettype {
        return new Tickettype(value);
    }
    equals(tickettype: Tickettype): boolean {
        return this.value === tickettype.value;
    }
    getValue(): string {
        return this.value;
    }

}