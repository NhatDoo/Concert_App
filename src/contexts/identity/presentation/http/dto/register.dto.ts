import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @IsString()
    name: string;

    @ApiProperty({ example: '+84901234567', description: 'Phone number' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: 'user@example.com', description: 'User valid email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'mypassword123', description: 'Password (min 8 chars)' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @ApiProperty({ example: 'USER', description: 'Role to register (e.g. USER or ORGANIZER)' })
    @IsString()
    role: string;
}
