export class Tickettype {
    constructor(public readonly value: string) {}   
    

    static VIP  = new Tickettype("VIP");
    static Regular = new Tickettype("Regular");

    static from(value: string): Tickettype {
        switch (value) {
            case "VIP":
                return Tickettype.VIP;
            case "Regular":
                return Tickettype.Regular;
            default:
                throw new Error("Invalid ticket type");
        }
    }
    equals(tickettype: Tickettype): boolean {
        return this.value === tickettype.value;
    }
    getValue(): string {
        return this.value;
    }
    
}