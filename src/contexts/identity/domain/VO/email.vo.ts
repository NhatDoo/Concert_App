export class Email {
    readonly value: string;

    constructor(value: string) {
        if (!value) {
            throw new Error("Email cannot be empty");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error("Invalid email format");
        }

        this.value = value;
    }

    equals(other: Email): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}