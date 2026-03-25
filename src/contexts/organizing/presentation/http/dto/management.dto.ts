import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLogisticsDto {
    @ApiProperty({ example: 'Sound System Setup', description: 'Logistics Task Name' })
    @IsString()
    @IsNotEmpty()
    taskName: string;

    @ApiProperty({ example: 'Yamaha Audio', description: 'Vendor name' })
    @IsString()
    @IsNotEmpty()
    vendor: string;

    @ApiProperty({ example: 1000.50, description: 'Budgeted cost' })
    @IsNumber()
    @Min(0)
    cost: number;
}

export class UpdateLogisticsStatusDto {
    @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
    @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    status: string;
}

export class AddEquipmentDto {
    @ApiProperty({ example: 'Lighting Rig', description: 'Equipment Name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: ['Beam Light', 'Strobe light'], description: 'Detail items' })
    @IsArray()
    @IsString({ each: true })
    details: string[];
}

export class AddStaffDto {
    @ApiProperty({ example: 'John Staff', description: 'Full name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: 'MANAGER', description: 'Staff role' })
    @IsString()
    @IsNotEmpty()
    role: string;
}
