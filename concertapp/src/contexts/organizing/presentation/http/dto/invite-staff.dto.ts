import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteStaffDto {
    @ApiProperty({ example: 'staff@example.com', description: 'Email to invite' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Security', description: 'Role assigned to the staff' })
    @IsString()
    role: string;

    @ApiProperty({ example: 'uuid-organizer-123', description: 'ID of the organizer' })
    @IsString()
    organizerId: string;

    @ApiPropertyOptional({ example: 'uuid-manager-123', description: 'Direct manager staff ID' })
    @IsOptional()
    @IsString()
    managerId?: string;
}
