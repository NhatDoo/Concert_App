export class Role {
  private constructor(private readonly value: string) {}

  static USER = new Role("USER");
  static ORGANIZER = new Role("ORGANIZER");
  static ADMIN = new Role("ADMIN");

  static from(value: string): Role {
    switch (value) {
      case "USER":
        return Role.USER;
      case "ORGANIZER":
        return Role.ORGANIZER;
      case "ADMIN":
        return Role.ADMIN;
      default:
        throw new Error("Invalid role");
    }
  }

  equals(role: Role): boolean {
    return this.value === role.value;
  }

  getValue(): string {
    return this.value;
  }
}