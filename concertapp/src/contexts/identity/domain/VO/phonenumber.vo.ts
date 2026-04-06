export class phoneNumber {
    value: string | null;
    constructor(value: string | null) {
        if (value && !this.validatePhoneNumber(value)) {
            throw new Error("Invalid phone number format");
        }
        this.value = value || null;
    }

    validatePhoneNumber(phoneNumber: string): boolean {
        if (!phoneNumber) return true;
        // Accept optional + followed by 9 to 15 digits (allowing leading zeroes)
        const phoneNumberPattern = /^\+?\d{9,15}$/;
        return phoneNumberPattern.test(phoneNumber);
    }
}