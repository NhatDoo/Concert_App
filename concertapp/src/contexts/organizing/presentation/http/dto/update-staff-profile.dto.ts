import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateStaffProfileDto {
    @ApiProperty({ example: 'John Doe', description: 'Real name of the staff member' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: '0123456789', description: 'Phone number' })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 'I am a pro designer', description: 'Staff biography' })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: 'http://minio/cv.pdf', description: 'CV URL from storage' })
    @IsString()
    @IsOptional()
    cvUrl?: string;
}
