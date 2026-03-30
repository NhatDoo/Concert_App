import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID UUID' })
    @IsString()
    userId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Concert ID UUID' })
    @IsString()
    concertId: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                ticketType: { type: 'string', example: 'VIP' },
                quantity: { type: 'number', example: 1 }
            }
        }
    })
    @IsArray()
    @ArrayNotEmpty()
    items: { ticketType: string; quantity: number }[];
}
