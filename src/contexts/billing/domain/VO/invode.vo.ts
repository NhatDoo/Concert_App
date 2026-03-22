// Value Object đại diện cho một mục/dòng trong hóa đơn
export class InvoiceItem {
    readonly description: string;     // Mô tả (vd: "Vé VIP Concert A", "Vé Thường Concert A")
    readonly quantity: number;        // Số lượng
    readonly unitPrice: number;       // Đơn giá
    readonly total: number;           // Thành tiền

    constructor(description: string, quantity: number, unitPrice: number) {
        if (quantity <= 0) throw new Error("Quantity must be greater than zero");
        if (unitPrice < 0) throw new Error("Unit price cannot be negative");

        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.total = quantity * unitPrice;
    }

    // Value Object bắt buộc xét tính bằng nhau thông qua toàn bộ giá trị thuộc tính (thay vì ID)
    equals(other: InvoiceItem): boolean {
        if (!other) return false;
        return this.description === other.description &&
            this.quantity === other.quantity &&
            this.unitPrice === other.unitPrice;
    }
}