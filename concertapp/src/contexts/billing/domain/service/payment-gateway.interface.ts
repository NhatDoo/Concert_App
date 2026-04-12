import { Money } from "../../../../common/domain/value-object/money.vo";

export interface PaymentRequest {
    orderId: string;
    amount: Money;
    orderInfo: string;
    ipAddress: string;
    returnUrl: string;
}

export interface PaymentVerificationResult {
    isSuccess: boolean;
    orderId: string;
    transactionId: string;
    amount: Money;
    message: string;
}

export interface RefundRequest {
    vnpTxnRef: string;
    vnpTransactionNo: string;
    vnpTransactionDate: string;
    amount: number;
    createBy: string;
    ipAddr: string;
}

export interface IPaymentGateway {

    generatePaymentUrl(request: PaymentRequest): Promise<string>;
    verifyPayment(query: any): Promise<PaymentVerificationResult>;
    refundPayment(request: RefundRequest): Promise<boolean>;
}

export const IPAYMENT_GATEWAY = Symbol('IPaymentGateway');
