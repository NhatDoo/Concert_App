import { InvoiceItem } from "../VO/invode.vo";
import { Money } from "../../../../common/domain/value-object/money.vo";

export interface ITaxPolicy {
    calculateTax(items: InvoiceItem[]): Money;
}

export class VAT10TaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): Money {
        const subtotal = items.reduce((sum, item) => sum.add(item.total), Money.create(0));
        return subtotal.multiply(0.1);
    }
}

export class VIPOnlyTaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): Money {
        const vipItems = items.filter(i => i.description.includes('VIP'));
        if (vipItems.length === 0) return Money.create(0);

        const vipTotal = vipItems.reduce((sum, item) => sum.add(item.total), Money.create(0));
        return vipTotal.multiply(0.15);
    }
}

export class NoTaxPolicy implements ITaxPolicy {
    calculateTax(items: InvoiceItem[]): Money {
        return Money.create(0);
    }
}
