export class phoneNumber {
    value: string
    constructor(value: string) {
        if (!this.validatePhoneNumber(value)) {
            throw new Error("Invalid phone number format");
        }
        this.value = value;
    }

    validatePhoneNumber(phoneNumber: string): boolean {
        // Accept optional + followed by 9 to 15 digits (allowing leading zeroes)
        const phoneNumberPattern = /^\+?\d{9,15}$/;
        return phoneNumberPattern.test(phoneNumber);
    }

}