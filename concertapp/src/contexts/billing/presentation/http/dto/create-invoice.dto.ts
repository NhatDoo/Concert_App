import { IsString, IsArray, ArrayNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
    @ApiProperty({ example: 'Vé VIP Concert A', description: 'Item description' })
    @IsString()
    description: string;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 150000, description: 'Unit price in smallest currency unit (VND)' })
    @IsNumber()
    unitPrice: number;
}

export class CreateInvoiceDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Booking ID UUID' })
    @IsString()
    bookingId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'User ID UUID' })
    @IsString()
    userId: string;

    @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice line items' })
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    @ApiProperty({ example: '2026-04-30T00:00:00.000Z', description: 'Due date for the invoice' })
    @IsDateString()
    dueDate: string;

    @ApiProperty({ example: 0, description: 'Discount amount in smallest currency unit', required: false })
    @IsOptional()
    @IsNumber()
    discountAmount?: number;
}
