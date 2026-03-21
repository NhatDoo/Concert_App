import { phoneNumber } from "../VO/user_vo/phonenumber.vo";
import { Email } from "../VO/user_vo/email.vo";
import { Password } from "../VO/user_vo/password.vo";
import { Role } from "../VO/user_vo/role.vo";
export class User{
    id: number ; 
    name: string ;
    phoneNumber: phoneNumber ;
    email: Email ;
    role: Role ;
    password: Password ;


    constructor(id: number, name: string, phoneNumber: phoneNumber, email: Email, password: Password , role: Role ) {
        this.id = id ;
        this.name = name ;
        this.phoneNumber = phoneNumber ;
        this.email = email ;
        this.password = password ;
        this.role = role ;
    }
    static create(
        id: number,
        name: string,
        phoneNumber: phoneNumber,
        email: Email,
        password: Password,
        role: Role
    ): User {
        if (!name) throw new Error("Name is required");
        return new User(id, name, phoneNumber, email, password , role);
    }

    getId(): number {
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
    setName(name: string): void {
        this.name = name;
    }
    setRole(role: Role): void {
        this.role = role;
    }
    setPhoneNumber(phoneNumber: phoneNumber): void {
        this.phoneNumber = phoneNumber;
    }
    setEmail(email: Email): void {
        this.email = email;
    }
    setPassword(password: Password): void {
        this.password = password;
    }

    async verifyPassword(plain: string) {
        return this.password.compare(plain);
    }
}