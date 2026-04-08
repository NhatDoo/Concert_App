import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStaffTaskDto {
    @ApiProperty({ example: 'Equipment Check', description: 'Task name' })
    @IsString()
    @IsNotEmpty()
    taskName: string;

    @ApiProperty({ example: 'Check VIP tickets at Entrance A', description: 'Task description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'manager-uuid', description: 'ID of the staff who assigned this task' })
    @IsString()
    @IsNotEmpty()
    managerId: string;

    @ApiProperty({ example: '2024-05-20T10:00:00Z', description: 'Task due date' })
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;
}

export class UpdateStaffTaskDto {
    @ApiProperty({ example: 'FINISH', enum: ['PENDING', 'WORKING', 'FINISH'] })
    @IsEnum(['PENDING', 'WORKING', 'FINISH'])
    status: string;
}
