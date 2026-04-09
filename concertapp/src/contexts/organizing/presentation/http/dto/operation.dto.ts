import { ApiProperty } from '@nestjs/swagger';

export class CreateEventRequirementDto {
    @ApiProperty()
    concertId: string;

    @ApiProperty()
    authorId: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    staffNeeded: number;

    @ApiProperty()
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
