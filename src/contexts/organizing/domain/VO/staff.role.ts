/**
 * StaffRole Value Object
 * Sự linh động tuyệt đối: Mọi giá trị String được cấp phép, vượt ra khỏi giới hạn của Enum
 */
export class StaffRole {
    private readonly roleName: string;

    private constructor(roleName: string) {
        this.roleName = roleName;
    }

    static create(roleName: string): StaffRole {
        if (!roleName || roleName.trim().length === 0) {
            throw new Error("Staff role cannot be empty");
        }

        if (roleName.length > 50) {
            throw new Error("Staff role name is too long (max 50 characters)");
        }

        // Tự động chuẩn hóa chuỗi (Ví dụ: "  manager  " -> "MANAGER")
        const normalizedRole = roleName.trim().toUpperCase();

        return new StaffRole(normalizedRole);
    }

    getValue(): string {
        return this.roleName;
    }

    equals(other: StaffRole): boolean {
        if (!other) return false;
        return this.roleName === other.getValue();
    }
}
