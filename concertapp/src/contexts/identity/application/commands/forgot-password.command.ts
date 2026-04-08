import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repository/user.repository.interface';
import { IUSER_REPOSITORY } from '../../domain/repository/user.repository.interface';
import { MailService } from '../../infrastructure/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

export class ForgotPasswordCommand implements ICommand {
    constructor(public readonly email: string) { }
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, void> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        private readonly mailService: MailService,
    ) { }

    async execute(command: ForgotPasswordCommand): Promise<void> {
        const user = await this.userRepository.findByEmail(command.email);
        if (!user) {
            // We shouldn't reveal if the email exists or not for security
            return;
        }

        const resetToken = uuidv4();
        // Set expiry to 1 hour
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        user.setResetToken(resetToken, expires);
        await this.userRepository.save(user);

        await this.mailService.sendPasswordResetEmail(user.getEmail().value, resetToken);
    }
}
