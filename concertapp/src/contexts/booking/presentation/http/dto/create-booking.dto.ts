import { IsString, IsArray, IsOptional, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TicketGroupDto {
    @ApiProperty({ example: 'Standee', description: 'Type of ticket' })
    @IsString()
    ticketType: string;

    @ApiProperty({ example: 2, description: 'Number of tickets' })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateBookingDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID UUID' })
    @IsString()
    userId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Concert ID UUID' })
    @IsString()
    concertId: string;

    @ApiProperty({
        type: 'array',
        items: { type: 'string' },
        required: false,
        example: ['123e4567-e89b-12d3-a456-426614174002']
    })
    @IsArray()
    @IsOptional()
    seatIds?: string[];

    @ApiProperty({
        type: [TicketGroupDto],
        required: false
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TicketGroupDto)
    ticketGroups?: TicketGroupDto[];
}
