import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../login.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
    ) { }

    async execute(command: LoginCommand): Promise<AuthTokens> {
        const { email, plainPassword } = command;

        // 1. Lấy thông tin User thông qua Email -> Trả về Domain Aggregate Root
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Gọi hàm verifyPassword đã đóng gói thuật toán Hash của Password VO
        const isPasswordValid = await user.verifyPassword(plainPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Generate Token qua ITokenService Interface (sẽ gọi JwtTokenService)
        const tokens = this.tokenService.generateTokens(user);

       
        user.updateRefreshToken(tokens.refreshToken);
        await this.userRepository.save(user);

        return tokens;
    }
}
