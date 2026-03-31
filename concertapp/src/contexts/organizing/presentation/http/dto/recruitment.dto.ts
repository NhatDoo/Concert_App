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

    @ApiProperty()
    @IsUUID()
    organizerId: string;

    @ApiProperty()
    @IsUUID()
    authorId: string; // Staff manager ID
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
