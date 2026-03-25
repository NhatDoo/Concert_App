import { IsString, IsNotEmpty, IsNumber, Min, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPerformanceDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Artist ID' })
    @IsUUID()
    artistId: string;

    @ApiProperty({ example: 'Opening Act - Sky Tour', description: 'Performance name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 45, description: 'Duration in minutes' })
    @IsNumber()
    @Min(1)
    durationMinutes: number;

    @ApiProperty({ example: '2026-06-15T19:00:00Z', description: 'Start time (ISO 8601)' })
    @IsDateString()
    startTime: string;
}

export class UpdatePerformanceScheduleDto {
    @ApiProperty({ example: '2026-06-15T20:00:00Z', description: 'New start time' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: 60, description: 'New duration in minutes' })
    @IsNumber()
    @Min(1)
    durationMinutes: number;
}
