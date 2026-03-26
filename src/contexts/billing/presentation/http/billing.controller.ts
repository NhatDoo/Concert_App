import { Body, Controller, Post, Get, Param, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateInvoiceCommand } from '../../application/commands/create-invoice.command';
import { IssueInvoiceCommand } from '../../application/commands/issue-invoice.command';
import { InitiatePaymentCommand } from '../../application/commands/initiate-payment.command';
import { ConfirmPaymentCommand } from '../../application/commands/confirm-payment.command';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
    constructor(private readonly commandBus: CommandBus) { }

    // ─── INVOICE ENDPOINTS ────────────────────────────────────────

    @Post('invoices')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new invoice for a booking' })
    @ApiResponse({ status: 201, description: 'Invoice created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Issue (finalize) a draft invoice' })
    @ApiResponse({ status: 200, description: 'Invoice issued successfully' })
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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Initiate a payment for an issued invoice' })
    @ApiResponse({ status: 200, description: 'Payment URL generated' })
    @ApiResponse({ status: 400, description: 'Invoice not in ISSUED status' })
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
}
