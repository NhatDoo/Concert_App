import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConcertDto {
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Organizer ID for ownership verification' })
    @IsUUID()
    @IsOptional()
    organizerId?: string;

    @ApiPropertyOptional({ example: 'The Eras Tour 2026 (Updated)', description: 'Updated name of the concert' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: '2026-12-31T20:00:00Z', description: 'Updated Start Date & Time' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: 'Updated Location', description: 'Updated location/address' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'New thumbnail image' })
    @IsOptional()
    image?: Express.Multer.File;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'New seat map image' })
    @IsOptional()
    seatMap?: Express.Multer.File;

    @ApiPropertyOptional({ example: '["music", "comedy"]', description: 'JSON string of category IDs' })
    @IsString()
    @IsOptional()
    categories?: string;

    @ApiPropertyOptional({ example: '#updated #concert', description: 'Updated hashtags' })
    @IsString()
    @IsOptional()
    hashtags?: string;

    @ApiPropertyOptional({
        example: '[{"label":"A1","ticketType":"VIP","price":1500000}]',
        description: 'Optional full replacement of seat definitions'
    })
    @IsString()
    @IsOptional()
    seats?: string;
}
