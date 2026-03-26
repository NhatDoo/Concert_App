import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginCommand } from '../../application/commands/login.command';
import { RegisterCommand } from '../../application/commands/register.command';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from '../../domain/service/token.service.interface';

@ApiTags('Auth')
@Controller('auth')
export class IdentityController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'Registration successful, tokens returned' })
    @ApiResponse({ status: 400, description: 'Format error in payload' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
        const command = new RegisterCommand(
            dto.name,
            dto.phoneNumber,
            dto.email,
            dto.password,
            dto.role
        );
        return this.commandBus.execute(command);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and return auth tokens' })
    @ApiResponse({ status: 200, description: 'Login successful, tokens returned' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto): Promise<AuthTokens> {
        // Compose command -> CommandBus dispatches to LoginHandler
        const command = new LoginCommand(dto.email, dto.password);

        // Expected return: AuthTokens object { accessToken: string, refreshToken: string }
        return this.commandBus.execute(command);
    }
}
