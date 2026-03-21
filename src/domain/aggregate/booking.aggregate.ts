import { Ticket } from "../entity/ticket.entity";

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export class Booking {
    private id: number;
    private userId: number;
    private concertId: number;
    private tickets: Ticket[];
    private totalAmount: number;
    private status: BookingStatus;
    private createdAt: Date;

    private constructor(
        id: number,
        userId: number,
        concertId: number,
        tickets: Ticket[],
        totalAmount: number,
        status: BookingStatus,
        createdAt: Date
    ) {
        this.id = id;
        this.userId = userId;
        this.concertId = concertId;
        this.tickets = tickets;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    /**
     * Factory method: Tạo một Booking mới (Luôn bắt đầu ở trạng thái PENDING)
     */
    static create(id: number, userId: number, concertId: number, tickets: Ticket[]): Booking {
        if (!tickets || tickets.length === 0) {
            throw new Error("A booking must contain at least one ticket.");
        }

        // Kiểm tra xem tất cả ticket có thuộc cùng một concert không
        const allSameConcert = tickets.every(t => t.getConcertId() === concertId);
        if (!allSameConcert) {
            throw new Error("All tickets in a booking must belong to the same concert.");
        }

        // Tính tổng tiền dựa trên giá của từng vé (Logic nghiệp vụ nằm ở đây)
        const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);

        return new Booking(
            id,
            userId,
            concertId,
            tickets,
            totalAmount,
            'PENDING',
            new Date()
        );
    }

    /**
     * Domain Behavior: Xác nhận thanh toán/đặt chỗ thành công
     */
    confirm(): void {
        if (this.status === 'CANCELLED') {
            throw new Error("Cannot confirm a cancelled booking.");
        }
        if (this.status === 'CONFIRMED') {
            throw new Error("Booking is already confirmed.");
        }
        this.status = 'CONFIRMED';
    }

    /**
     * Domain Behavior: Hủy đặt chỗ
     */
    cancel(): void {
        if (this.status === 'CONFIRMED') {
            throw new Error("Cannot cancel a confirmed booking (require refund process).");
        }
        this.status = 'CANCELLED';
    }

    /**
     * Domain Behavior: Thêm vé vào Booking (chỉ khi chưa xác nhận)
     */
    addTicket(ticket: Ticket): void {
        if (this.status !== 'PENDING') {
            throw new Error("Can only add tickets to a PENDING booking.");
        }
        if (ticket.getConcertId() !== this.concertId) {
            throw new Error("Cannot add ticket from a different concert.");
        }

        this.tickets.push(ticket);
        this.recalculateTotalAmount();
    }

    /**
     * Method nội bộ để cập nhật lại tổng tiền mỗi khi số lượng vé thay đổi
     */
    private recalculateTotalAmount(): void {
        this.totalAmount = this.tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);
    }

    // Getters (Chỉ expose những thứ cần thiết, giấu các logic set data trực tiếp)
    getId(): number {
        return this.id;
    }

    getUserId(): number {
        return this.userId;
    }

    getConcertId(): number {
        return this.concertId;
    }

    getTickets(): Ticket[] {
        // Trả về một bản copy của mảng tickets để tránh bị mutability (sửa đổi mảng gốc từ bên ngoài)
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
