import { IsString, IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignLocationDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the Concert' })
    @IsUUID()
    concertId: string;

    @ApiProperty({ example: 'My Dinh National Stadium', description: 'Name of the location' })
    @IsString()
    @IsNotEmpty()
    locationName: string;

    @ApiProperty({ example: 'Le Duc Tho, My Dinh, Nam Tu Liem, Ha Noi', description: 'Full address block' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 40000, description: 'Maximum audience capacity' })
    @IsInt()
    @Min(1)
    capacity: number;
}
