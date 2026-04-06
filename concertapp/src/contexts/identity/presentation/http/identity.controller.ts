import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginCommand } from '../../application/commands/login.command';
import { RegisterCommand } from '../../application/commands/register.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from '../../domain/service/token.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards, Req, Get, Res } from '@nestjs/common';
import { GoogleAuthCommand } from '../../application/commands/google-auth.command';

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
        console.log('[DEBUG] IdentityController.register - dto:', JSON.stringify(dto, null, 2));
        const command = new RegisterCommand(
            dto.name,
            dto.phoneNumber,
            dto.email,
            dto.password,
            dto.role,
            dto.staffRole,
            dto.inviteToken
        );
        return this.commandBus.execute(command);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and return auth tokens' })
    @ApiResponse({ status: 200, description: 'Login successful, tokens returned' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto): Promise<AuthTokens> {
        const command = new LoginCommand(dto.email, dto.password);
        return this.commandBus.execute(command);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    async refreshToken(@Body('refreshToken') refreshToken: string): Promise<AuthTokens> {
        return this.commandBus.execute(new RefreshTokenCommand(refreshToken));
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Login via Google' })
    async googleAuth(@Req() req) {
        // Guard handles the redirect to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google auth callback' })
    async googleAuthRedirect(@Req() req, @Res() res) {
        const tokens: AuthTokens = await this.commandBus.execute(
            new GoogleAuthCommand(req.user.email, req.user.name, req.user.googleId)
        );

        // Redirect to frontend with tokens in URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
    }
}
