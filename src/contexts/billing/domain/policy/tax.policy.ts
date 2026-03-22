import { InvoiceItem } from "../VO/invode.vo";

// BƯỚC 1: Xây dựng Interface - MỞ RỘNG (Open for Extension)
export interface ITaxPolicy {
    calculateTax(items: InvoiceItem[]): number;
}

// BƯỚC 2: Viết các class chiến lược (Strategy) riêng biệt dựa trên rule
// Ví dụ 1: Tính thuế 10% thông thường
export class VAT10TaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): number {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        return subtotal * 0.1;
    }
}

// Ví dụ 2: Thuế VIP (chỉ áp dụng thuế 15% cho vé VIP, vé thường miễn thuế)
export class VIPOnlyTaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): number {
        const vipTotal = items.filter(i => i.description.includes('VIP')).reduce((sum, item) => sum + item.total, 0);
        return vipTotal * 0.15;
    }
}

// Ví dụ 3: Sự kiện từ thiện (Không đánh thuế)
export class NoTaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): number {
        return 0;
    }
}
