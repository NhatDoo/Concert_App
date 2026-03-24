import { Booking } from "../aggregate/booking.aggregate";
import { BookingId } from "../VO/booking-id.vo";


export interface IBookingRepository {
    save(booking: Booking): Promise<void>;
    findById(id: BookingId): Promise<Booking | null>;
    findByUserId(userId: number): Promise<Booking[]>;
    delete(id: BookingId): Promise<void>;
}
