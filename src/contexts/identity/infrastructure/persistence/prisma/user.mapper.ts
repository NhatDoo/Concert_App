import { User as UserAggregate } from "../../../domain/entity/user.entity";
import { Email } from "../../../domain/VO/email.vo";
import { Password } from "../../../domain/VO/password.vo";
import { phoneNumber } from "../../../domain/VO/phonenumber.vo";
import { Role } from "../../../domain/VO/role.vo";

export class UserMapper {
    static toDomain(raw: any): UserAggregate | null {
        if (!raw) return null;
        return UserAggregate.create(
            raw.id,
            raw.name,
            new phoneNumber(raw.phoneNumber),
            new Email(raw.email),
            Password.fromHash(raw.password),
            Role.from(raw.role),
            raw.refreshToken || null
        );
    }

    static toPersistence(user: UserAggregate) {
        return {
            id: user.getId(),
            name: user.getName(),
            phoneNumber: user.getPhoneNumber().value,
            email: user.getEmail().value,
            password: user.getPassword().getValue(),
            role: user.getRole().getValue(),
            refreshToken: user.getRefreshToken()
        };
    }
}
