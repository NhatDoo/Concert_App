import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStaffTaskDto {
    @ApiProperty({ example: 'Check VIP tickets at Entrance A', description: 'Task description' })
    @IsString()
    @IsNotEmpty()
    description: string;
}

export class UpdateStaffTaskDto {
    @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
    @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    status: string;
}
