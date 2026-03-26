import { Inject, ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterCommand } from '../register.command';
import { IUSER_REPOSITORY } from '../../../domain/repository/user.repository.interface';
import type { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { User } from '../../../domain/entity/user.entity';
import { Email } from '../../../domain/VO/email.vo';
import { Password } from '../../../domain/VO/password.vo';
import { phoneNumber } from '../../../domain/VO/phonenumber.vo';
import { Role } from '../../../domain/VO/role.vo';
import { ITOKEN_SERVICE } from '../../../domain/service/token.service.interface';
import type { ITokenService, AuthTokens } from '../../../domain/service/token.service.interface';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, AuthTokens> {
    constructor(
        @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ITOKEN_SERVICE) private readonly tokenService: ITokenService,
    ) { }

    async execute(command: RegisterCommand): Promise<AuthTokens> {
        const { name, phoneNumber: phone, email: mail, plainPassword, role } = command;

        // 1. Kiểm tra Email xem có bị trùng hay không
        const existingUser = await this.userRepository.findByEmail(mail);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // 2. Wrap dữ liệu thành Value Objects (Sẽ thảy exception tự động nếu sai định dạng)
        const emailVO = new Email(mail);
        const phoneVO = new phoneNumber(phone);
        const roleVO = Role.from(role);

        // 3. Hash mật khẩu thông qua Value Object Password
        const passwordVO = await Password.create(plainPassword);

        // 4. Tạo Domain Aggregate Root User
        const newUserId = uuidv4();
        const user = User.create(
            newUserId,
            name,
            phoneVO,
            emailVO,
            passwordVO,
            roleVO
        );

        // 5. Generate token (Tùy theo UX, thường đky xong login luôn thì cấp Token)
        const tokens = this.tokenService.generateTokens(user);

        // 6. Cập nhật refreshToken mới trước khi cấu hình persist
        user.updateRefreshToken(tokens.refreshToken);

        // 7. Save xuống DB
        await this.userRepository.save(user);

        return tokens;
    }
}
