import bcrypt from "bcrypt"

export class Password {
  private constructor(private readonly value: string) {}

  static async create(plain: string): Promise<Password> {
    if (plain.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }
    const hash = await bcrypt.hash(plain, 10)
    return new Password(hash)
  }

  static fromHash(hash: string): Password {
    return new Password(hash)
  }

  async compare(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.value)
  }

  getValue(): string {
    return this.value
  }
}