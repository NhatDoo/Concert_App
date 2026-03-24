import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IPAYMENT_GATEWAY } from '../domain/service/payment-gateway.interface';
import { VnpayGateway } from './payments/vnpay-gateway';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: IPAYMENT_GATEWAY,
            useClass: VnpayGateway,
        },
    ],
    exports: [IPAYMENT_GATEWAY],
})
export class BillingInfrastructureModule { }
