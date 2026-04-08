import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'uuid' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ example: 'oldPassword123' })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ example: 'newPassword123' })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    newPassword: string;
}
