import { Booking } from "../aggregate/booking.aggregate";
import { BookingId } from "../VO/booking-id.vo";


export const IBOOKING_REPOSITORY = Symbol('IBookingRepository');

export interface IBookingRepository {
    save(booking: Booking): Promise<void>;
    findById(id: BookingId): Promise<Booking | null>;
    findByUserId(userId: string): Promise<Booking[]>;
    delete(id: BookingId): Promise<void>;
}
