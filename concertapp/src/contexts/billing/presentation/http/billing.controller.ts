import { Body, Controller, Post, Get, Param, Query, HttpCode, HttpStatus, Req, UseGuards, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../identity/infrastructure/auth/jwt-auth.guard';
import { CreateInvoiceCommand } from '../../application/commands/create-invoice.command';
import { IssueInvoiceCommand } from '../../application/commands/issue-invoice.command';
import { InitiatePaymentCommand } from '../../application/commands/initiate-payment.command';
import { ConfirmPaymentCommand } from '../../application/commands/confirm-payment.command';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { IINVOICE_REPOSITORY } from '../../domain/repository/invoice.repository.interface';
import type { IInvoiceRepository } from '../../domain/repository/invoice.repository.interface';
import { PrismaService } from '../../../../prisma.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IINVOICE_REPOSITORY) private readonly invoiceRepo: IInvoiceRepository,
        private readonly prisma: PrismaService,
    ) { }

    // ─── INVOICE ENDPOINTS ────────────────────────────────────────

    @Post('invoices')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new invoice for a booking' })
    @ApiResponse({ status: 201, description: 'Invoice created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createInvoice(@Body() dto: CreateInvoiceDto) {
        const command = new CreateInvoiceCommand(
            dto.bookingId,
            dto.userId,
            dto.items,
            new Date(dto.dueDate),
            dto.discountAmount,
        );

        const invoiceId = await this.commandBus.execute(command);

        return {
            message: 'Invoice created successfully',
            invoiceId,
        };
    }

    @Post('invoices/:id/issue')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Issue (finalize) a draft invoice' })
    @ApiResponse({ status: 200, description: 'Invoice issued successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    async issueInvoice(@Param('id') invoiceId: string) {
        const command = new IssueInvoiceCommand(invoiceId);
        await this.commandBus.execute(command);

        return {
            message: 'Invoice issued successfully',
        };
    }

    // ─── PAYMENT ENDPOINTS ────────────────────────────────────────

    @Post('payments/initiate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initiate a payment for an issued invoice' })
    @ApiResponse({ status: 200, description: 'Payment URL generated' })
    @ApiResponse({ status: 400, description: 'Invoice not in ISSUED status' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    async initiatePayment(@Body() dto: InitiatePaymentDto, @Req() req: Request) {
        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

        const command = new InitiatePaymentCommand(
            dto.invoiceId,
            dto.method,
            ipAddress,
            dto.returnUrl,
        );

        const paymentUrl = await this.commandBus.execute(command);

        return {
            message: 'Payment URL generated successfully',
            paymentUrl,
        };
    }

    @Get('payments/callback')
    @ApiOperation({ summary: 'VNPay payment callback (return URL)' })
    @ApiResponse({ status: 200, description: 'Payment verification result' })
    async paymentCallback(@Query() query: Record<string, any>) {
        const command = new ConfirmPaymentCommand(query);
        const result = await this.commandBus.execute(command);

        return result;
    }

    // ─── HISTORY ENDPOINTS ────────────────────────────────────────

    @Get('my-history')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get full invoice & payment history for a user' })
    @ApiResponse({ status: 200, description: 'List of invoices with payment status' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyHistory(@Query('userId') userId: string) {
        if (!userId) throw new BadRequestException('userId query param is required');

        const invoices = await this.prisma.invoice.findMany({
            where: { userId },
            orderBy: { issueDate: 'desc' },
            include: {
                items: true,
                payments: {
                    orderBy: { createdAt: 'desc' }
                },
                booking: {
                    select: {
                        id: true,
                        status: true,
                        concert: {
                            select: { id: true, name: true, startDate: true, imageUrl: true }
                        }
                    }
                }
            }
        });

        return invoices.map(inv => ({
            invoiceId: inv.id,
            bookingId: inv.bookingId,
            status: inv.status,
            totalAmount: inv.items.reduce((sum, item) => sum + item.total, 0),
            discountAmount: inv.discountAmount,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            concert: inv.booking?.concert ?? null,
            bookingStatus: inv.booking?.status ?? null,
            payments: inv.payments.map(p => ({
                paymentId: p.id,
                method: p.method,
                amount: p.amount,
                status: p.status,
                transactionId: p.transactionId,
                createdAt: p.createdAt,
            }))
        }));
    }

    @Post('payments/booking/:bookingId/initiate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initiate payment directly from booking ID (auto-find invoice)' })
    @ApiResponse({ status: 200, description: 'Payment URL generated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'No invoice found for this booking' })
    async initiatePaymentFromBooking(
        @Param('bookingId') bookingId: string,
        @Body() dto: InitiatePaymentDto,
        @Req() req: Request,
    ) {
        // 1. Tìm invoice theo bookingId
        const invoice = await this.invoiceRepo.findByBookingId(bookingId);
        if (!invoice) {
            throw new NotFoundException(`Không tìm thấy invoice cho booking ${bookingId}`);
        }

        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

        // 2. Dispatch InitiatePaymentCommand với invoiceId tìm được
        const command = new InitiatePaymentCommand(
            invoice.id,
            dto.method,
            ipAddress,
            dto.returnUrl,
        );

        const paymentUrl = await this.commandBus.execute(command);

        return {
            message: 'Payment URL generated successfully',
            paymentUrl,
        };
    }
}
