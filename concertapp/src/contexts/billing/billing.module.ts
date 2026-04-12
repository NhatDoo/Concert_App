import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingInfrastructureModule } from './infrastructure/billing-infrastructure.module';
import { IdentityInfrastructureModule } from '../identity/infrastructure/identity-infrastructure.module';
import { BillingController } from './presentation/http/billing.controller';
import { CreateInvoiceHandler } from './application/commands/handlers/create-invoice.handler';
import { IssueInvoiceHandler } from './application/commands/handlers/issue-invoice.handler';
import { InitiatePaymentHandler } from './application/commands/handlers/initiate-payment.handler';
import { ConfirmPaymentHandler } from './application/commands/handlers/confirm-payment.handler';
import { BookingCreatedEventHandler } from './application/events/handlers/booking-created.event-handler';
import { BookingCancelledEventHandler } from './application/events/handlers/booking-cancelled.event-handler';

export const CommandHandlers = [
    CreateInvoiceHandler,
    IssueInvoiceHandler,
    InitiatePaymentHandler,
    ConfirmPaymentHandler,
];

export const EventHandlers = [BookingCreatedEventHandler, BookingCancelledEventHandler];

@Module({
    imports: [
        CqrsModule,
        BillingInfrastructureModule,
        IdentityInfrastructureModule,
    ],
    controllers: [
        BillingController,
    ],
    providers: [
        ...CommandHandlers,
        ...EventHandlers,
    ],
})
export class BillingModule { }
