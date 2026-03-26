import { Injectable } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repository/invoice.repository.interface';
import { InvoiceAggregate } from '../../../domain/aggregate/invoice.aggregate';
import { PrismaService } from '../../../../../prisma.service';
import { InvoiceMapper } from './invoice.mapper';

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<InvoiceAggregate | null> {
        const raw = await this.prisma.invoice.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!raw) return null;
        return InvoiceMapper.toDomain(raw);
    }

    async findByBookingId(bookingId: string): Promise<InvoiceAggregate | null> {
        const raw = await this.prisma.invoice.findFirst({
            where: { bookingId },
            include: { items: true },
        });

        if (!raw) return null;
        return InvoiceMapper.toDomain(raw);
    }

    async findByUserId(userId: string): Promise<InvoiceAggregate[]> {
        const raws = await this.prisma.invoice.findMany({
            where: { userId },
            include: { items: true },
        });

        return raws.map(raw => InvoiceMapper.toDomain(raw));
    }

    async save(invoice: InvoiceAggregate): Promise<void> {
        const persistence = InvoiceMapper.toPersistence(invoice);
        const itemsData = InvoiceMapper.itemsToPersistence(invoice.id, invoice.items);

        await this.prisma.$transaction(async (tx) => {
            const existing = await tx.invoice.findUnique({
                where: { id: persistence.id },
                select: { id: true, version: true },
            });

            if (!existing) {
                // Create new invoice
                await tx.invoice.create({
                    data: {
                        id: persistence.id,
                        bookingId: persistence.bookingId,
                        userId: persistence.userId,
                        taxAmount: persistence.taxAmount,
                        discountAmount: persistence.discountAmount,
                        status: persistence.status,
                        issueDate: persistence.issueDate,
                        dueDate: persistence.dueDate,
                        paymentId: persistence.paymentId,
                        version: 1,
                        items: {
                            create: itemsData,
                        },
                    },
                });
            } else {
                // Update existing invoice with optimistic locking
                const updateResult = await tx.invoice.updateMany({
                    where: {
                        id: persistence.id,
                        version: existing.version,
                    },
                    data: {
                        taxAmount: persistence.taxAmount,
                        discountAmount: persistence.discountAmount,
                        status: persistence.status,
                        paymentId: persistence.paymentId,
                        version: { increment: 1 },
                    },
                });

                if (updateResult.count === 0) {
                    throw new Error(`Concurrency conflict on Invoice ${persistence.id}`);
                }

                // Recreate items for aggregate consistency
                await tx.invoiceItem.deleteMany({
                    where: { invoiceId: persistence.id },
                });

                if (itemsData.length > 0) {
                    await tx.invoiceItem.createMany({
                        data: itemsData,
                    });
                }
            }
        });
    }
}
