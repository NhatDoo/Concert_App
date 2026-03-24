import { AggregateRoot } from "@nestjs/cqrs";
import { phoneNumber } from "../VO/phonenumber.vo";
import { Email } from "../VO/email.vo";
import { Password } from "../VO/password.vo";
import { Role } from "../VO/role.vo";

export class User extends AggregateRoot {
    private readonly id: string;
    private name: string;
    private phoneNumber: phoneNumber;
    private email: Email;
    private role: Role;
    private password: Password;
    private refreshToken: string | null;

    private constructor(
        id: string,
        name: string,
        phoneNumber: phoneNumber,
        email: Email,
        password: Password,
        role: Role,
        refreshToken: string | null = null
    ) {
        super();
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.role = role;
        this.refreshToken = refreshToken;
    }

    static create(
        id: string,
        name: string,
        phoneNumber: phoneNumber,
        email: Email,
        password: Password,
        role: Role,
        refreshToken: string | null = null
    ): User {
        if (!name) throw new Error("Name is required");
        return new User(id, name, phoneNumber, email, password, role, refreshToken);
    }

    getId(): string {
        return this.id;
    }
    getRole(): Role {
        return this.role;
    }
    getName(): string {
        return this.name;
    }
    getPhoneNumber(): phoneNumber {
        return this.phoneNumber;
    }
    getEmail(): Email {
        return this.email;
    }
    getPassword(): Password {
        return this.password;
    }
    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    changeName(newName: string): void {
        if (!newName) throw new Error("Name cannot be empty");
        this.name = newName;
    }

    assignRole(newRole: Role): void {
        this.role = newRole;
    }

    updateRefreshToken(token: string | null): void {
        this.refreshToken = token;
    }

    changePhoneNumber(newPhoneNumber: phoneNumber): void {
        this.phoneNumber = newPhoneNumber;
    }

    changeEmail(newEmail: Email): void {
        this.email = newEmail;
    }

    changePassword(newPassword: Password): void {
        // Here you might emit a UserPasswordChangedEvent if you had one.
        this.password = newPassword;
    }

    async verifyPassword(plain: string) {
        return this.password.compare(plain);
    }
}