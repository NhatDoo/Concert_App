import { AggregateRoot } from '@nestjs/cqrs';
import { Ticket } from "../entity/ticket.entity";
import { BookingCreatedEvent } from '../events/booking-created.event';
import { BookingConfirmedEvent } from '../events/booking-confirmed.event';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';
import { BookingId } from '../VO/booking-id.vo';
import { UserId } from '../../../identity/domain/VO/user-id.vo';
import { ConcertId } from '../../../concert/domain/VO/concert-id.vo';
import { InvalidBookingStateException } from '../exception/invalid-booking-state.exception';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export class Booking extends AggregateRoot {
    private readonly id: BookingId;
    private readonly userId: UserId;
    private readonly concertId: ConcertId;
    private tickets: Ticket[];
    private totalAmount: number;
    private status: BookingStatus;
    private readonly createdAt: Date;

    private constructor(
        id: BookingId,
        userId: UserId,
        concertId: ConcertId,
        tickets: Ticket[],
        totalAmount: number,
        status: BookingStatus,
        createdAt: Date
    ) {
        super();
        this.id = id;
        this.userId = userId;
        this.concertId = concertId;
        this.tickets = tickets;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }


    static create(id: BookingId, userId: UserId, concertId: ConcertId, tickets: Ticket[]): Booking {
        if (!tickets || tickets.length === 0) {
            throw new Error("A booking must contain at least one ticket.");
        }

        const allSameConcert = tickets.every(t => t.getConcertId() === concertId.getNumber());
        if (!allSameConcert) {
            throw new Error("All tickets in a booking must belong to the same concert.");
        }

        const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);

        const booking = new Booking(
            id,
            userId,
            concertId,
            tickets,
            totalAmount,
            'PENDING',
            new Date()
        );

        booking.apply(new BookingCreatedEvent(
            id.getNumber(),
            userId.getNumber(),
            concertId.getNumber(),
            totalAmount
        ));
        return booking;
    }


    confirm(): void {
        if (this.status === 'CANCELLED') {
            throw new InvalidBookingStateException('confirm', this.status);
        }
        if (this.status === 'CONFIRMED') {
            throw new InvalidBookingStateException('confirm', this.status);
        }
        this.status = 'CONFIRMED';
        this.apply(new BookingConfirmedEvent(this.id.getNumber(), this.totalAmount));
    }

    cancel(): void {
        if (this.status === 'CONFIRMED') {
            throw new InvalidBookingStateException('cancel', this.status);
        }
        this.status = 'CANCELLED';
        this.apply(new BookingCancelledEvent(this.id.getNumber()));
    }


    addTicket(ticket: Ticket): void {
        if (this.status !== 'PENDING') {
            throw new InvalidBookingStateException('add ticket', this.status);
        }
        if (ticket.getConcertId() !== this.concertId.getNumber()) {
            throw new Error("Cannot add ticket from a different concert.");
        }

        this.tickets.push(ticket);
        this.recalculateTotalAmount();
    }


    private recalculateTotalAmount(): void {
        this.totalAmount = this.tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);
    }
    getId(): BookingId {
        return this.id;
    }

    getUserId(): UserId {
        return this.userId;
    }

    getConcertId(): ConcertId {
        return this.concertId;
    }

    getTickets(): Ticket[] {
        return [...this.tickets];
    }

    getTotalAmount(): number {
        return this.totalAmount;
    }

    getStatus(): BookingStatus {
        return this.status;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
