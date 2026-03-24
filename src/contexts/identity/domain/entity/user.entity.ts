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

    private constructor(id: string, name: string, phoneNumber: phoneNumber, email: Email, password: Password, role: Role) {
        super();
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static create(
        id: string,
        name: string,
        phoneNumber: phoneNumber,
        email: Email,
        password: Password,
        role: Role
    ): User {
        if (!name) throw new Error("Name is required");
        return new User(id, name, phoneNumber, email, password, role);
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

    changeName(newName: string): void {
        if (!newName) throw new Error("Name cannot be empty");
        this.name = newName;
    }

    assignRole(newRole: Role): void {
        this.role = newRole;
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