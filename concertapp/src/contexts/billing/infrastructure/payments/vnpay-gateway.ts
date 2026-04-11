import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VNPay, ProductCode, VnpLocale, HashAlgorithm, dateFormat } from 'vnpay';
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
        this.vnp_TmnCode = (this.configService.get<string>('VNP_TMN_CODE') || '').trim();
        this.vnp_SecureSecret = (this.configService.get<string>('VNP_HASH_SECRET') || '').trim();

        this.vnpay = new VNPay({
            tmnCode: this.vnp_TmnCode,
            secureSecret: this.vnp_SecureSecret,
            vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });
    }

    async generatePaymentUrl(request: PaymentRequest): Promise<string> {
        try {
            const attemptKey = crypto.randomBytes(3).toString('hex');
            // Nhân 100 thủ công để đảm bảo tuyệt đối đúng spec VNPAY
            const amount = Math.floor(request.amount.getAmount() * 100);
            const vnpTxnRef = `${request.orderId.split('-')[0]}_${attemptKey}`;
            const createDate = dateFormat(new Date());

            // Đính kèm full orderId (UUID) vào ReturnUrl để lấy lại lúc verify
            const separator = request.returnUrl.includes('?') ? '&' : '?';
            const returnUrlWithId = `${request.returnUrl}${separator}orderId=${request.orderId}`;

            const params: any = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: this.vnp_TmnCode,
                vnp_Amount: amount,
                vnp_CurrCode: 'VND',
                vnp_TxnRef: vnpTxnRef,
                vnp_OrderInfo: `Thanh-toan-hoa-don-${request.orderId.split('-')[0]}`,
                vnp_OrderType: 'other',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: returnUrlWithId,
                vnp_IpAddr: request.ipAddress && request.ipAddress.includes('.') ? request.ipAddress : '127.0.0.1',
                vnp_CreateDate: createDate,
            };

            const paymentUrl = this.vnpay.buildPaymentUrl(params);

            console.log('--- [VNPay URL Generated] ---');
            console.log('Actual Amount:', amount);
            console.log('URL:', paymentUrl);

            return paymentUrl;
        } catch (error: any) {
            console.error('VNPay generation error:', error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async verifyPayment(query: any): Promise<PaymentVerificationResult> {
        try {
            const verify = this.vnpay.verifyReturnUrl(query);

            // Ưu tiên lấy orderId từ query (ta đã gắn vào ReturnUrl)
            const orderId = query.orderId || query.vnp_TxnRef.split('_')[0];

            const isSuccess = verify.isSuccess && query.vnp_ResponseCode === '00';
            const amountFromVnpay = Math.round(Number(query.vnp_Amount) / 100);

            return {
                isSuccess: isSuccess,
                orderId: orderId,
                transactionId: query.vnp_TransactionNo || "",
                amount: Money.create(amountFromVnpay),
                message: isSuccess ? 'Payment successful' : `Payment failed with code ${query.vnp_ResponseCode}`
            };
        } catch (error: any) {
            throw new InternalServerErrorException({
                message: 'Error verifying VNPay response',
                error: error.message,
            });
        }
    }
}
