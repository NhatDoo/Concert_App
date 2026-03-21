export class Role {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static from(value: string): Role {
    if (!value || value.trim().length === 0) {
      throw new Error("User role cannot be empty");
    }

    if (value.length > 50) {
      throw new Error("User role name is too long (max 50 characters)");
    }

    const normalizedRole = value.trim().toUpperCase();
    return new Role(normalizedRole);
  }

  // Cung cấp sẵn các Getter cho những Role cốt lõi của hệ thống, giúp dễ gọi (eg: Role.USER)
  static get USER(): Role { return Role.from("USER"); }
  static get ORGANIZER(): Role { return Role.from("ORGANIZER"); }
  static get ADMIN(): Role { return Role.from("ADMIN"); }

  equals(role: Role): boolean {
    if (!role) return false;
    return this.value === role.getValue();
  }

  getValue(): string {
    return this.value;
  }
}