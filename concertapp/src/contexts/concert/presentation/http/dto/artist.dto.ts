import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtistDto {
    @ApiProperty({ example: 'Sơn Tùng MTP', description: 'Artist name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Vietnamese pop singer', description: 'Artist biography', required: false })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: 'sontung@email.com', description: 'Contact info', required: false })
    @IsString()
    @IsOptional()
    contactInfo?: string;
}

export class UpdateArtistDto {
    @ApiProperty({ example: 'Sơn Tùng MTP' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Updated bio' })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: 'new@email.com' })
    @IsString()
    @IsOptional()
    contactInfo?: string;
}
