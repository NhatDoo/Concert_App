import { AggregateRoot } from "@nestjs/cqrs";
import { phoneNumber } from "../VO/phonenumber.vo";
import { Email } from "../VO/email.vo";
import { Password } from "../VO/password.vo";
import { Role } from "../VO/role.vo";

export class User extends AggregateRoot {
    private readonly id: string;
    private name: string;
    private phoneNumber: phoneNumber | null;
    private email: Email;
    private role: Role;
    private password: Password;
    private provider: string;
    private googleId: string | null;
    private refreshToken: string | null;
    private resetToken: string | null;
    private resetTokenExpires: Date | null;

    private constructor(
        id: string,
        name: string,
        phoneNumber: phoneNumber | null,
        email: Email,
        password: Password,
        role: Role,
        provider: string = "LOCAL",
        googleId: string | null = null,
        refreshToken: string | null = null,
        resetToken: string | null = null,
        resetTokenExpires: Date | null = null
    ) {
        super();
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.role = role;
        this.provider = provider;
        this.googleId = googleId;
        this.refreshToken = refreshToken;
        this.resetToken = resetToken;
        this.resetTokenExpires = resetTokenExpires;
    }

    static create(
        id: string,
        name: string,
        phoneNumber: phoneNumber | null,
        email: Email,
        password: Password,
        role: Role,
        provider: string = "LOCAL",
        googleId: string | null = null,
        refreshToken: string | null = null,
        resetToken: string | null = null,
        resetTokenExpires: Date | null = null
    ): User {
        if (!name) throw new Error("Name is required");
        return new User(id, name, phoneNumber, email, password, role, provider, googleId, refreshToken, resetToken, resetTokenExpires);
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
    getPhoneNumber(): phoneNumber | null {
        return this.phoneNumber;
    }
    getEmail(): Email {
        return this.email;
    }
    getPassword(): Password {
        return this.password;
    }
    getProvider(): string {
        return this.provider;
    }
    getGoogleId(): string | null {
        return this.googleId;
    }
    getRefreshToken(): string | null {
        return this.refreshToken;
    }
    getResetToken(): string | null {
        return this.resetToken;
    }
    getResetTokenExpires(): Date | null {
        return this.resetTokenExpires;
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
        this.password = newPassword;
    }

    setResetToken(token: string, expires: Date): void {
        this.resetToken = token;
        this.resetTokenExpires = expires;
    }

    clearResetToken(): void {
        this.resetToken = null;
        this.resetTokenExpires = null;
    }

    async verifyPassword(plain: string) {
        return this.password.compare(plain);
    }
}