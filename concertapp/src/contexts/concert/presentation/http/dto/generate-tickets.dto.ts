import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketTypeEnum {
    VIP = 'VIP',
    VVIP = 'VVIP',
    Regular = 'Regular',
    Discounted = 'Discounted'
}

export class TicketTypeQuantityDto {
    @ApiProperty({ example: 'Regular', enum: TicketTypeEnum })
    @IsEnum(TicketTypeEnum)
    type: string;

    @ApiProperty({ example: 1000000, description: 'Price in local currency' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 500, description: 'Quantity of tickets' })
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class GenerateTicketsDto {
    @ApiProperty({ type: [TicketTypeQuantityDto], description: 'List of tickets to generate' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TicketTypeQuantityDto)
    ticketTypes: TicketTypeQuantityDto[];
}
