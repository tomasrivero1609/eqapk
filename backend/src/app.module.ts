import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ClientsModule } from './clients/clients.module';
import { DishesModule } from './dishes/dishes.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { CalendarModule } from './calendar/calendar.module';
import { PaymentsModule } from './payments/payments.module';
import { MailModule } from './mail/mail.module';
import { DemonstrationsModule } from './demonstrations/demonstrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    EventsModule,
    ClientsModule,
    DishesModule,
    MenusModule,
    OrdersModule,
    CalendarModule,
    PaymentsModule,
    MailModule,
    DemonstrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
