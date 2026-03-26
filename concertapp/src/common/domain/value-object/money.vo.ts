export class Money {
    private readonly amount: number;
    private readonly currency: string;

    private constructor(amount: number, currency: string = 'VND') {

        if (!Number.isInteger(amount)) {
            throw new Error("Money amount must be an integer (smallest currency unit) to avoid floating point errors.");
        }
        if (amount < 0) {
            throw new Error("Money amount cannot be negative.");
        }
        this.amount = amount;
        this.currency = currency;
    }

    static create(amount: number, currency: string = 'VND'): Money {
        return new Money(amount, currency);
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error("Cannot add money of different currencies.");
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error("Cannot subtract money of different currencies.");
        }
        // Giả sử hệ thống không cho phép số dư âm ở cấp độ giao dịch
        if (this.amount - other.amount < 0) {
            throw new Error("Subtracting would result in a negative amount.");
        }
        return new Money(this.amount - other.amount, this.currency);
    }

    multiply(multiplier: number): Money {
        // Tự động làm tròn về số nguyên gần nhất khi nhân
        const result = Math.round(this.amount * multiplier);
        return new Money(result, this.currency);
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }
}
