import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingInfrastructureModule } from './infrastructure/billing-infrastructure.module';
import { BillingController } from './presentation/http/billing.controller';
import { CreateInvoiceHandler } from './application/commands/handlers/create-invoice.handler';
import { IssueInvoiceHandler } from './application/commands/handlers/issue-invoice.handler';
import { InitiatePaymentHandler } from './application/commands/handlers/initiate-payment.handler';
import { ConfirmPaymentHandler } from './application/commands/handlers/confirm-payment.handler';

export const CommandHandlers = [
    CreateInvoiceHandler,
    IssueInvoiceHandler,
    InitiatePaymentHandler,
    ConfirmPaymentHandler,
];

@Module({
    imports: [
        CqrsModule,
        BillingInfrastructureModule,
    ],
    controllers: [
        BillingController,
    ],
    providers: [
        ...CommandHandlers,
    ],
})
export class BillingModule { }
