import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Currency } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { eventId, paidAt, exchangeRateDate, platesCovered, ...rest } =
      createPaymentDto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        client: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...rest,
        eventId,
        paidAt: paidAt ? new Date(paidAt) : undefined,
        exchangeRateDate: exchangeRateDate
          ? new Date(exchangeRateDate)
          : undefined,
        platesCovered: platesCovered ?? undefined,
        pricePerDishAtPayment:
          platesCovered ? event.pricePerDish : undefined,
      },
    });

    if (event.client?.email) {
      await this.mailService.sendPaymentEmail({
        to: event.client.email,
        name: event.client.name,
        eventName: event.name,
        amount: `${payment.currency} ${payment.amount.toFixed(2)}`,
        paidAt: (payment.paidAt || new Date()).toISOString().slice(0, 10),
      });
    }

    return payment;
  }

  async findAll(eventId?: string) {
    return this.prisma.payment.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: {
        paidAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Pago eliminado correctamente' };
  }

  async getSummary() {
    const grouped = await this.prisma.payment.groupBy({
      by: ['currency'],
      _sum: {
        amount: true,
      },
    });

    const totals = {
      [Currency.ARS]: 0,
      [Currency.USD]: 0,
    };

    grouped.forEach((item) => {
      totals[item.currency] = item._sum.amount || 0;
    });

    return totals;
  }
}
