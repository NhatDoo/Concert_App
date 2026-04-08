import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repository/user.repository.interface';
import { IUSER_REPOSITORY } from '../../domain/repository/user.repository.interface';
import { Password } from '../../domain/VO/password.vo';

export class ChangePasswordCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly oldPassword: string,
        public readonly newPassword: string,
    ) { }
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, void> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
    ) { }

    async execute(command: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await user.verifyPassword(command.oldPassword);
        if (!isPasswordValid) {
            throw new BadRequestException('Incorrect old password');
        }

        try {
            const newPasswordVo = await Password.create(command.newPassword);
            user.changePassword(newPasswordVo);
        } catch (error) {
            throw new BadRequestException(error.message);
        }

        await this.userRepository.save(user);
    }
}
