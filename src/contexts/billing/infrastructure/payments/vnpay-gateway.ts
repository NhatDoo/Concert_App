import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VNPay, ProductCode, VnpLocale, HashAlgorithm } from 'vnpay';
import { IPaymentGateway, PaymentRequest, PaymentVerificationResult } from '../../domain/service/payment-gateway.interface';
import { Money } from '../../../../common/domain/value-object/money.vo';
import * as crypto from 'crypto';

@Injectable()
export class VnpayGateway implements IPaymentGateway {
    private readonly vnpay: VNPay;
    private readonly vnp_TmnCode: string;
    private readonly vnp_SecureSecret: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.vnp_TmnCode = this.configService.get<string>('VNP_TMN_CODE') || '';
        this.vnp_SecureSecret = this.configService.get<string>('VNP_HASH_SECRET') || '';

        this.vnpay = new VNPay({
            tmnCode: this.vnp_TmnCode,
            secureSecret: this.vnp_SecureSecret,
            vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });
    }

    private getFormattedDate(): number {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        return Number(`${year}${month}${day}${hour}${minute}${second}`);
    }

    async generatePaymentUrl(request: PaymentRequest): Promise<string> {
        try {
            const attemptKey = crypto.randomBytes(4).toString('hex');
            const amount = request.amount.getAmount() * 100;
            const vnpTxnRef = `${request.orderId}_${attemptKey}`;

            const paymentUrl = this.vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: request.ipAddress || '127.0.0.1',
                vnp_TxnRef: vnpTxnRef,
                vnp_OrderInfo: request.orderInfo,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: request.returnUrl,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: this.getFormattedDate(),
            });

            return paymentUrl;
        } catch (error: any) {
            throw new InternalServerErrorException({
                message: 'Error generating VNPay URL',
                error: error.message,
            });
        }
    }

    async verifyPayment(query: any): Promise<PaymentVerificationResult> {
        try {
            const verify = this.vnpay.verifyReturnUrl(query);

            const txnRef = query.vnp_TxnRef || "";
            const [orderId, attemptKey] = txnRef.split('_');

            if (!orderId) {
                throw new BadRequestException(`Invalid order ID in vnp_TxnRef: ${txnRef}`);
            }

            const isSuccess = verify.isSuccess && query.vnp_ResponseCode === '00';
            const amountFromVnpay = Math.round(Number(query.vnp_Amount) / 100);

            return {
                isSuccess: isSuccess,
                orderId: orderId,
                transactionId: query.vnp_TransactionNo || "",
                amount: Money.create(amountFromVnpay),
                // We'll fix the dynamic import issue by putting it cleanly in imports later, actually let's just use a top-level import
                message: isSuccess ? 'Payment successful' : 'Payment failed'
            };
        } catch (error: any) {
            throw new InternalServerErrorException({
                message: 'Error verifying VNPay response',
                error: error.message,
            });
        }
    }
}
