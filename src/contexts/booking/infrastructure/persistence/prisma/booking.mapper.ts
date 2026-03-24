import { Booking as BookingAggregate, BookingStatus } from "../../../domain/aggregate/booking.aggregate";
import { Ticket as TicketEntity } from "../../../domain/entity/ticket.entity";
import { BookingId } from "../../../domain/VO/booking-id.vo";
import { UserId } from "../../../../identity/domain/VO/user-id.vo";
import { ConcertId } from "../../../../concert/domain/VO/concert-id.vo";
import { Tickettype } from "../../../domain/VO/tickettype.vo";
import { BookingModel } from "../../../../../generated/prisma/models/Booking";
import { TicketModel } from "../../../../../generated/prisma/models/Ticket";
import { Money } from "../../../../../common/domain/value-object/money.vo";

export class BookingMapper {
    static toDomain(raw: BookingModel & { tickets?: TicketModel[] }): BookingAggregate {
        const tickets = raw.tickets?.map(t =>
            TicketEntity.create(
                t.id,
                t.concertId,
                t.userId || "",
                Money.create(t.price),
                Tickettype.from(t.ticketType)
            )
        ) || [];

        return BookingAggregate.reconstruct(
            BookingId.create(raw.id),
            UserId.create(raw.userId),
            ConcertId.create(raw.concertId),
            tickets,
            Money.create(raw.totalAmount),
            raw.status as BookingStatus,
            raw.createdAt,
            raw.version
        );
    }

    static toPersistence(booking: BookingAggregate) {
        return {
            id: booking.getId().getString(),
            userId: booking.getUserId().getString(),
            concertId: booking.getConcertId().getString(),
            totalAmount: booking.getTotalAmount().getAmount(),
            status: booking.getStatus(),
            version: booking.getVersion(),
            createdAt: booking.getCreatedAt(),
        };
    }
}
