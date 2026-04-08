import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAuthCommand } from '../google-auth.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { User } from '../../../domain/entity/user.entity';
import { Email } from '../../../domain/VO/email.vo';
import { Password } from '../../../domain/VO/password.vo';
import { phoneNumber } from '../../../domain/VO/phonenumber.vo';
import { Role } from '../../../domain/VO/role.vo';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
        private readonly configService: ConfigService,
    ) { }

    async execute(command: GoogleAuthCommand): Promise<AuthTokens> {
        const { email, name, googleId } = command;

        // 1. Check if user exists by email
        let user = await this.userRepository.findByEmail(email);

        if (user) {
            // Found existing user, just return tokens
            const tokens = this.tokenService.generateTokens(user);
            user.updateRefreshToken(tokens.refreshToken);
            await this.userRepository.save(user);
            return tokens;
        }

        // 2. Create new user if not exists
        const emailVO = new Email(email);
        const phoneVO = new phoneNumber(null); // OAuth might not have phone
        const roleVO = Role.from('USER'); // Default role as requested

        // Mật khẩu hash mặc định lấy từ .env
        const defaultHash = this.configService.get<string>('DEFAULT_OAUTH_PASSWORD_HASH');
        const passwordVO = Password.fromHash(defaultHash!);

        const newUserId = uuidv4();
        user = User.create(
            newUserId,
            name,
            phoneVO,
            emailVO,
            passwordVO,
            roleVO,
            "GOOGLE",
            googleId
        );

        const tokens = this.tokenService.generateTokens(user);
        user.updateRefreshToken(tokens.refreshToken);

        await this.userRepository.save(user);

        return tokens;
    }
}
