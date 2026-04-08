import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repository/user.repository.interface';
import { IUSER_REPOSITORY } from '../../domain/repository/user.repository.interface';
import { Password } from '../../domain/VO/password.vo';

export class ResetPasswordCommand implements ICommand {
    constructor(
        public readonly token: string,
        public readonly newPassword: string,
    ) { }
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, void> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
    ) { }

    async execute(command: ResetPasswordCommand): Promise<void> {
        const user = await this.userRepository.findByResetToken(command.token);

        if (!user) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        if (!user.getResetTokenExpires() || user.getResetTokenExpires()! < new Date()) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        try {
            const newPasswordVo = await Password.create(command.newPassword);
            user.changePassword(newPasswordVo);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
        user.clearResetToken();

        await this.userRepository.save(user);
    }
}
