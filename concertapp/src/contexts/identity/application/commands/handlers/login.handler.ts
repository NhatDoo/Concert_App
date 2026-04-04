import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../login.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';
import { PrismaService } from '../../../../../prisma.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(command: LoginCommand): Promise<AuthTokens> {
        const { email, plainPassword } = command;

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await user.verifyPassword(plainPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Look up staff record to embed staffRole into JWT
        let staffRole: string | undefined;
        try {
            const staffRecord = await this.prisma.staff.findFirst({
                where: { userId: user.getId() }
            });
            if (staffRecord?.role) {
                staffRole = staffRecord.role;
            }
        } catch (e) {
            // Non-blocking: if lookup fails, token still works without staffRole
        }

        const tokens = this.tokenService.generateTokens(user, staffRole);

        user.updateRefreshToken(tokens.refreshToken);
        await this.userRepository.save(user);

        return tokens;
    }
}
