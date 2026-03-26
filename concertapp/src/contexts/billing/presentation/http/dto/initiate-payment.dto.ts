import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice ID UUID' })
    @IsString()
    invoiceId: string;

    @ApiProperty({ example: 'VNPAY', description: 'Payment method: CREDIT_CARD, BANK_TRANSFER, E_WALLET, VNPAY, CASH' })
    @IsString()
    method: string;

    @ApiProperty({ example: 'http://localhost:3000/billing/payment/callback', description: 'URL to return to after payment' })
    @IsString()
    returnUrl: string;
}
