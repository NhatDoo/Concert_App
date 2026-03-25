import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssignLocationCommand } from '../../application/commands/assign-location.command';
import { AssignLocationDto } from './dto/assign-location.dto';

@ApiTags('Organizing')
@Controller('organize')
export class OrganizingController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('location')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign a location to a corresponding concert organization' })
    @ApiResponse({ status: 200, description: 'Location successfully assigned and synched' })
    @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid UUID)' })
    async assignLocation(@Body() dto: AssignLocationDto): Promise<{ message: string }> {
        const command = new AssignLocationCommand(
            dto.concertId,
            dto.locationName,
            dto.address,
            dto.capacity
        );

        await this.commandBus.execute(command);

        return {
            message: 'Location successfully assigned to Concert logic.'
        };
    }
}
