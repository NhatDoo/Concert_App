import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { BillingModule } from './contexts/billing/billing.module';
import { BookingModule } from './contexts/booking/booking.module';
import { IdentityModule } from './contexts/identity/identity.module';
import { ConcertModule } from './contexts/concert/concert.module';
import { OrganizingModule } from './contexts/organizing/organizing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    BillingModule,
    BookingModule,
    IdentityModule,
    ConcertModule,
    OrganizingModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }

