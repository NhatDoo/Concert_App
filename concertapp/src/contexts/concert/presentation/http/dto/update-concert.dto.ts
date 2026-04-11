import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConcertDto {
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

    @ApiPropertyOptional({ example: '["music", "comedy"]', description: 'JSON string of category IDs' })
    @IsString()
    @IsOptional()
    categories?: string;

    @ApiPropertyOptional({ example: '#updated #concert', description: 'Updated hashtags' })
    @IsString()
    @IsOptional()
    hashtags?: string;
}
