import { IsString, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
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
    image?: Express.Multer.File;
}
