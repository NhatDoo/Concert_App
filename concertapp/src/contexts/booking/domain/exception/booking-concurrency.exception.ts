export class BookingConcurrencyException extends Error {
    constructor(id: string) {
        super(`Booking with ID ${id} was modified by another process. Please try again.`);
        this.name = 'BookingConcurrencyException';
    }
}
