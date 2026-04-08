import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty()
    userId: string;

    @ApiProperty({ required: false })
    name?: string;

    @ApiProperty({ required: false })
    phoneNumber?: string;
}
