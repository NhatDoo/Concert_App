import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../refresh-token.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
        private readonly prisma: PrismaService,
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

        // 3. Look up staff record for sub-role
        let staffRole: string | undefined;
        try {
            const staffRecord = await this.prisma.staff.findFirst({
                where: { userId: user.getId() }
            });
            if (staffRecord?.role) {
                staffRole = staffRecord.role;
            }
        } catch (e) {
            // Non-blocking
        }

        // 4. Generate New Tokens with staffRole
        const tokens = this.tokenService.generateTokens(user, staffRole);

        // 5. Update the stored Refresh Token
        user.updateRefreshToken(tokens.refreshToken);
        await this.userRepository.save(user);

        return tokens;
    }
}
