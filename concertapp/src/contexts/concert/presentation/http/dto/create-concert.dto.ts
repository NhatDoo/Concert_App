import { IsString, IsNotEmpty, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConcertDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the Organizer (User)' })
    @IsUUID()
    organizerId: string;

    @ApiProperty({ example: 'The Eras Tour 2026', description: 'Name of the concert' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '2026-12-31T20:00:00Z', description: 'Start Date & Time of the concert (Must be in the future)' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: 'My Dinh National Stadium', description: 'Location string/address of the venue' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Thumbnail image for the concert' })
    @IsOptional()
    image?: Express.Multer.File;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Seat map image stored on MinIO' })
    @IsOptional()
    seatMap?: Express.Multer.File;

    @ApiPropertyOptional({ example: '["music", "comedy"]', description: 'JSON string of category IDs' })
    @IsString()
    @IsOptional()
    categories?: string;

    @ApiPropertyOptional({ example: '#music #fun', description: 'Hashtags string' })
    @IsString()
    @IsOptional()
    hashtags?: string;

    @ApiPropertyOptional({
        example: '[{"label":"A1","ticketType":"VIP","price":1500000},{"label":"B1","ticketType":"REGULAR","price":500000}]',
        description: 'JSON string of seat definitions for the concert'
    })
    @IsString()
    @IsOptional()
    seats?: string;
}
