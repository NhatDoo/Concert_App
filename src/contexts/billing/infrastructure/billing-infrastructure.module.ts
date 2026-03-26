import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IPAYMENT_GATEWAY } from '../domain/service/payment-gateway.interface';
import { VnpayGateway } from './payments/vnpay-gateway';
import { IINVOICE_REPOSITORY } from '../domain/repository/invoice.repository.interface';
import { PrismaInvoiceRepository } from './persistence/prisma/prisma-invoice.repository';
import { IPAYMENT_REPOSITORY } from '../domain/repository/payment.repository.interface';
import { PrismaPaymentRepository } from './persistence/prisma/prisma-payment.repository';
import { PrismaService } from '../../../prisma.service';

@Module({
    imports: [ConfigModule],
    providers: [
        PrismaService,
        {
            provide: IPAYMENT_GATEWAY,
            useClass: VnpayGateway,
        },
        {
            provide: IINVOICE_REPOSITORY,
            useClass: PrismaInvoiceRepository,
        },
        {
            provide: IPAYMENT_REPOSITORY,
            useClass: PrismaPaymentRepository,
        },
    ],
    exports: [IPAYMENT_GATEWAY, IINVOICE_REPOSITORY, IPAYMENT_REPOSITORY],
})
export class BillingInfrastructureModule { }
