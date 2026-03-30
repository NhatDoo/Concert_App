import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../refresh-token.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
    ) { }

    async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
        const { refreshToken } = command;

        // 1. Verify Refresh Token
        const payload = this.tokenService.verifyToken(refreshToken, true);
        const userId = payload.sub;

        // 2. Fetch User and verify stored refresh token (Optional but more secure)
        const user = await this.userRepository.findById(userId);
        if (!user || user.getRefreshToken() !== refreshToken) {
            throw new UnauthorizedException('Token is no longer valid');
        }

        // 3. Generate New Tokens
        const tokens = this.tokenService.generateTokens(user);

        // 4. Update the stored Refresh Token
        user.updateRefreshToken(tokens.refreshToken);
        await this.userRepository.save(user);

        return tokens;
    }
}
