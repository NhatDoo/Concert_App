import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User login email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'mypassword123', description: 'User login password (min 8 chars)' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}
