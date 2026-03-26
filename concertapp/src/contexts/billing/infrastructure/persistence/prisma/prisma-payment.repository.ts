import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { Payment } from '../../../domain/entity/payment.entity';
import { PrismaService } from '../../../../../prisma.service';
import { PaymentMapper } from './payment.mapper';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Payment | null> {
        const raw = await this.prisma.payment.findUnique({
            where: { id },
        });

        if (!raw) return null;
        return PaymentMapper.toDomain(raw);
    }

    async findByBookingId(bookingId: string): Promise<Payment[]> {
        const raws = await this.prisma.payment.findMany({
            where: { bookingId },
        });

        return raws.map((raw) => PaymentMapper.toDomain(raw));
    }

    async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
        const raws = await this.prisma.payment.findMany({
            where: { invoiceId },
        });

        return raws.map((raw) => PaymentMapper.toDomain(raw));
    }

    async save(payment: Payment): Promise<void> {
        const persistence = PaymentMapper.toPersistence(payment);

        await this.prisma.payment.upsert({
            where: { id: persistence.id },
            create: {
                id: persistence.id,
                invoiceId: persistence.invoiceId,
                bookingId: persistence.bookingId,
                amount: persistence.amount,
                method: persistence.method,
                status: persistence.status,
                transactionId: persistence.transactionId,
                createdAt: persistence.createdAt,
                updatedAt: persistence.updatedAt,
            },
            update: {
                status: persistence.status,
                transactionId: persistence.transactionId,
                updatedAt: persistence.updatedAt,
            },
        });
    }
}
