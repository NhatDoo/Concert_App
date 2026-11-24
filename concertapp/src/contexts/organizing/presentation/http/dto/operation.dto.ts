import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventRequirementDto {
    @ApiProperty()
    concertId: string;

    @ApiProperty()
    authorId: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @IsNumber()
    @Min(0)
    staffNeeded: number;

    @ApiProperty({ description: 'Number of equipment items needed for this requirement', default: 0 })
    @IsNumber()
    @Min(0)
    equipmentNeeded: number;

    @ApiProperty({ description: 'Allocated budget for this operation requirement', default: 0 })
    budgetAllocated: number;

    @ApiProperty({ required: false })
    vendorId?: string;
}

export class CreateZoneDto {
    @ApiProperty()
    @IsString()
    concertId: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    capacity?: number;

    @ApiProperty({ required: false, minimum: 0, maximum: 100, default: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    mapX?: number;

    @ApiProperty({ required: false, minimum: 0, maximum: 100, default: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    mapY?: number;
}

export class CreateHallZoneDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    capacity?: number;

    @ApiProperty({ minimum: 0, maximum: 100, default: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    mapX?: number;

    @ApiProperty({ minimum: 0, maximum: 100, default: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    mapY?: number;
}

export class UpdateZonePositionDto {
    @ApiProperty({ minimum: 0, maximum: 100 })
    @IsNumber()
    @Min(0)
    @Max(100)
    mapX: number;

    @ApiProperty({ minimum: 0, maximum: 100 })
    @IsNumber()
    @Min(0)
    @Max(100)
    mapY: number;
}

export class CreateShiftDto {
    @ApiProperty()
    concertId: string;

    @ApiProperty()
    zoneId: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    startTime: string;

    @ApiProperty()
    endTime: string;

    @ApiProperty()
    headcount: number;

    @ApiProperty({ required: false })
    managerId?: string;
}

export class AssignShiftDto {
    @ApiProperty()
    shiftId: string;

    @ApiProperty()
    staffId: string;
}
