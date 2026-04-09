import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

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
    concertId: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    capacity?: number;
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
