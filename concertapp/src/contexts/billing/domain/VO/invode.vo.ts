import { Money } from "../../../../common/domain/value-object/money.vo";

// Value Object đại diện cho một mục/dòng trong hóa đơn
export class InvoiceItem {
    readonly description: string;     // Mô tả (vd: "Vé VIP Concert A", "Vé Thường Concert A")
    readonly quantity: number;        // Số lượng
    readonly unitPrice: Money;        // Đơn giá
    readonly total: Money;            // Thành tiền

    constructor(description: string, quantity: number, unitPrice: Money) {
        if (quantity <= 0) throw new Error("Quantity must be greater than zero");

        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.total = unitPrice.multiply(quantity);
    }

    // Value Object bắt buộc xét tính bằng nhau thông qua toàn bộ giá trị thuộc tính (thay vì ID)
    equals(other: InvoiceItem): boolean {
        if (!other) return false;
        return this.description === other.description &&
            this.quantity === other.quantity &&
            this.unitPrice.equals(other.unitPrice);
    }
}