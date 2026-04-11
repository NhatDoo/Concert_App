import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateJobPostDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    requirements: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    companyLogo?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    salary?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    concertId?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    authorStaffId?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    authorUserId?: string;

    @ApiProperty({ required: false, enum: ['STAFF', 'MANAGER', 'EVENT_MANAGER'] })
    @IsString()
    @IsOptional()
    category?: string;
}

export class UpdateJobPostDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    requirements?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    companyLogo?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    salary?: string;

    @ApiProperty({ required: false, enum: ['OPEN', 'CLOSED'] })
    @IsString()
    @IsOptional()
    status?: 'OPEN' | 'CLOSED';

    @ApiProperty({ required: false, enum: ['STAFF', 'MANAGER'] })
    @IsString()
    @IsOptional()
    category?: string;
}


export class CreateApplicationDto {
    @ApiProperty()
    @IsUUID()
    applicantId: string;

    @ApiProperty()
    @IsUUID()
    jobPostId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cvUrl: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    message?: string;
}

export class ReviewApplicationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status: 'APPROVED' | 'REJECTED';
}
