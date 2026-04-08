import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IUSER_REPOSITORY } from '../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../domain/repository/user.repository.interface';
import { phoneNumber } from '../../domain/VO/phonenumber.vo';
import { ITOKEN_SERVICE } from '../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../domain/service/token.service.interface';

export class UpdateProfileCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly name?: string,
        public readonly phoneNumber?: string,
    ) { }
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
    ) { }

    async execute(command: UpdateProfileCommand): Promise<AuthTokens> {
        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (command.name) {
            user.changeName(command.name);
        }

        if (command.phoneNumber) {
            user.changePhoneNumber(new phoneNumber(command.phoneNumber));
        }

        await this.userRepository.save(user);

        // Generate new tokens with updated information
        const tokens = this.tokenService.generateTokens(user);

        // Update refresh token in DB
        user.updateRefreshToken(tokens.refreshToken);
        await this.userRepository.save(user);

        return tokens;
    }
}
