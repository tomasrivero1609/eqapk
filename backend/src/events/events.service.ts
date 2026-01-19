import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarService } from '../calendar/calendar.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
    private mailService: MailService,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto) {
    const adultCount = createEventDto.adultCount ?? 0;
    const juvenileCount = createEventDto.juvenileCount ?? 0;
    const childCount = createEventDto.childCount ?? 0;
    const sectionCount = adultCount + juvenileCount + childCount;
    const adultPrice = createEventDto.adultPrice ?? 0;
    const juvenilePrice = createEventDto.juvenilePrice ?? 0;
    const childPrice = createEventDto.childPrice ?? 0;

    const fallbackDishCount = createEventDto.dishCount ?? 0;
    const fallbackPrice = createEventDto.pricePerDish ?? 0;

    const dishCount = sectionCount > 0 ? sectionCount : fallbackDishCount;
    const guestCount =
      sectionCount > 0 ? sectionCount : createEventDto.guestCount;
    const totalAmount =
      sectionCount > 0
        ? adultCount * adultPrice +
          juvenileCount * juvenilePrice +
          childCount * childPrice
        : fallbackDishCount * fallbackPrice;

    const quarterlyAdjustmentPercent =
      createEventDto.quarterlyAdjustmentPercent ?? 0;

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        totalAmount,
        dishCount,
        guestCount,
        pricePerDish: sectionCount > 0 ? 0 : fallbackPrice,
        quarterlyAdjustmentPercent,
        quarterlyAdjustmentEnabled: quarterlyAdjustmentPercent > 0,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
        menus: {
          include: {
            menu: true,
          },
        },
        payments: true,
      },
    });

    if (event.client?.email) {
      await this.mailService.sendEventCreatedEmail({
        to: event.client.email,
        name: event.client.name,
        eventName: event.name,
        date: event.date.toISOString().slice(0, 10),
        startTime: event.startTime,
        endTime: event.endTime || undefined,
        total: `${event.currency} ${event.totalAmount.toFixed(2)}`,
      });
    }

    try {
      const calendarEventId = await this.calendarService.createEvent({
        title: event.name,
        description: event.description || undefined,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime || undefined,
      });

      if (calendarEventId) {
        await this.prisma.event.update({
          where: { id: event.id },
          data: { calendarEventId },
        });
        event.calendarEventId = calendarEventId;
      }
    } catch (error) {
      this.logger.warn(
        `Calendar create error: ${(error as Error).message}`,
      );
    }

    return event;
  }

  async findAll(userId: string) {
    return this.prisma.event.findMany({
      include: {
        client: true,
        menus: {
          include: {
            menu: true,
          },
        },
        payments: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: true,
        menus: {
          include: {
            menu: {
              include: {
                menuDishes: {
                  include: {
                    dish: true,
                  },
                },
              },
            },
          },
        },
        orders: {
          include: {
            items: {
              include: {
                dish: true,
                menu: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            paidAt: 'desc',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }

  async update(id: string, userId: string, updateEventDto: UpdateEventDto) {
    // Verificar que el evento existe y pertenece al usuario
    const event = await this.findOne(id, userId);

    const shouldRecomputeTotal =
      updateEventDto.dishCount !== undefined ||
      updateEventDto.pricePerDish !== undefined ||
      updateEventDto.adultCount !== undefined ||
      updateEventDto.juvenileCount !== undefined ||
      updateEventDto.childCount !== undefined ||
      updateEventDto.adultPrice !== undefined ||
      updateEventDto.juvenilePrice !== undefined ||
      updateEventDto.childPrice !== undefined;

    const adultCount = updateEventDto.adultCount ?? event.adultCount;
    const juvenileCount =
      updateEventDto.juvenileCount ?? event.juvenileCount;
    const childCount = updateEventDto.childCount ?? event.childCount;
    const sectionCount = adultCount + juvenileCount + childCount;
    const adultPrice = updateEventDto.adultPrice ?? event.adultPrice;
    const juvenilePrice =
      updateEventDto.juvenilePrice ?? event.juvenilePrice;
    const childPrice = updateEventDto.childPrice ?? event.childPrice;

    const dishCount =
      sectionCount > 0
        ? sectionCount
        : updateEventDto.dishCount ?? event.dishCount;
    const pricePerDish =
      sectionCount > 0
        ? 0
        : updateEventDto.pricePerDish ?? event.pricePerDish;
    const totalAmount = shouldRecomputeTotal
      ? sectionCount > 0
        ? adultCount * adultPrice +
          juvenileCount * juvenilePrice +
          childCount * childPrice
        : dishCount * pricePerDish
      : event.totalAmount;
    const guestCount =
      sectionCount > 0
        ? sectionCount
        : updateEventDto.guestCount ?? event.guestCount;
    const quarterlyAdjustmentPercent =
      updateEventDto.quarterlyAdjustmentPercent ??
      event.quarterlyAdjustmentPercent;
    const quarterlyAdjustmentEnabled = quarterlyAdjustmentPercent > 0;

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
        ...(shouldRecomputeTotal && {
          totalAmount,
          dishCount,
          pricePerDish,
          guestCount,
        }),
        quarterlyAdjustmentPercent,
        quarterlyAdjustmentEnabled,
      },
      include: {
        client: true,
        menus: {
          include: {
            menu: true,
          },
        },
        payments: {
          orderBy: {
            paidAt: 'desc',
          },
        },
      },
    });

    if (updatedEvent.calendarEventId) {
      try {
        await this.calendarService.updateEvent(updatedEvent.calendarEventId, {
          title: updatedEvent.name,
          description: updatedEvent.description || undefined,
          date: updatedEvent.date,
          startTime: updatedEvent.startTime,
          endTime: updatedEvent.endTime || undefined,
        });
      } catch (error) {
        this.logger.warn(
          `Calendar update error: ${(error as Error).message}`,
        );
      }
    }

    return updatedEvent;
  }

  async checkAvailability(date: string) {
    return this.calendarService.checkDateAvailability(date);
  }

  async previewQuarterlyAdjustment(id: string, userId: string) {
    const event = await this.findOne(id, userId);
    if (!event.quarterlyAdjustmentEnabled || event.quarterlyAdjustmentPercent <= 0) {
      throw new BadRequestException('El evento no tiene ajuste trimestral configurado');
    }

    const baseDate = event.lastAdjustmentAt ?? event.createdAt;
    const nextEligible = new Date(baseDate);
    nextEligible.setMonth(nextEligible.getMonth() + 3);
    const eligible = new Date() >= nextEligible;

    const sectionTotal =
      (event.adultCount || 0) +
      (event.juvenileCount || 0) +
      (event.childCount || 0);
    const sectionData =
      sectionTotal === 0 && event.dishCount > 0
        ? {
            adultCount: event.dishCount,
            juvenileCount: 0,
            childCount: 0,
            adultPrice: event.pricePerDish,
            juvenilePrice: 0,
            childPrice: 0,
          }
        : {
            adultCount: event.adultCount,
            juvenileCount: event.juvenileCount,
            childCount: event.childCount,
            adultPrice: event.adultPrice,
            juvenilePrice: event.juvenilePrice,
            childPrice: event.childPrice,
          };

    const coveredTotals = (event.payments || []).reduce(
      (acc, payment) => {
        const hasSections =
          payment.adultCovered != null ||
          payment.juvenileCovered != null ||
          payment.childCovered != null;
        const adult = hasSections ? payment.adultCovered || 0 : payment.platesCovered || 0;
        const juvenile = hasSections ? payment.juvenileCovered || 0 : 0;
        const child = hasSections ? payment.childCovered || 0 : 0;
        acc.adultCovered += adult;
        acc.juvenileCovered += juvenile;
        acc.childCovered += child;
        return acc;
      },
      { adultCovered: 0, juvenileCovered: 0, childCovered: 0 },
    );

    const remaining = {
      adult: Math.max(0, sectionData.adultCount - coveredTotals.adultCovered),
      juvenile: Math.max(0, sectionData.juvenileCount - coveredTotals.juvenileCovered),
      child: Math.max(0, sectionData.childCount - coveredTotals.childCovered),
    };

    const factor = 1 + event.quarterlyAdjustmentPercent / 100;
    const newPrices = {
      adult: Number((sectionData.adultPrice * factor).toFixed(2)),
      juvenile: Number((sectionData.juvenilePrice * factor).toFixed(2)),
      child: Number((sectionData.childPrice * factor).toFixed(2)),
    };

    return {
      eligible,
      nextEligibleAt: nextEligible.toISOString(),
      percent: event.quarterlyAdjustmentPercent,
      remaining,
      currentPrices: {
        adult: sectionData.adultPrice,
        juvenile: sectionData.juvenilePrice,
        child: sectionData.childPrice,
      },
      newPrices,
    };
  }

  async applyQuarterlyAdjustment(id: string, userId: string) {
    const preview = await this.previewQuarterlyAdjustment(id, userId);
    if (!preview.eligible) {
      throw new BadRequestException('Aun no corresponde el ajuste trimestral');
    }

    const event = await this.findOne(id, userId);
    const factor = 1 + event.quarterlyAdjustmentPercent / 100;
    const sectionTotal =
      (event.adultCount || 0) +
      (event.juvenileCount || 0) +
      (event.childCount || 0);
    const usesSections = sectionTotal > 0;

    const updatedPrices = usesSections
      ? {
          adultPrice: Number((event.adultPrice * factor).toFixed(2)),
          juvenilePrice: Number((event.juvenilePrice * factor).toFixed(2)),
          childPrice: Number((event.childPrice * factor).toFixed(2)),
          pricePerDish: event.pricePerDish,
        }
      : {
          adultPrice: event.adultPrice,
          juvenilePrice: event.juvenilePrice,
          childPrice: event.childPrice,
          pricePerDish: Number((event.pricePerDish * factor).toFixed(2)),
        };

    const coveredTotals = (event.payments || []).reduce(
      (acc, payment) => {
        const hasSections =
          payment.adultCovered != null ||
          payment.juvenileCovered != null ||
          payment.childCovered != null;
        const adult = hasSections ? payment.adultCovered || 0 : payment.platesCovered || 0;
        const juvenile = hasSections ? payment.juvenileCovered || 0 : 0;
        const child = hasSections ? payment.childCovered || 0 : 0;
        const adultPrice =
          payment.adultPriceAtPayment ?? (usesSections ? event.adultPrice : event.pricePerDish);
        const juvenilePrice =
          payment.juvenilePriceAtPayment ?? event.juvenilePrice;
        const childPrice =
          payment.childPriceAtPayment ?? event.childPrice;
        acc.adultCovered += adult;
        acc.juvenileCovered += juvenile;
        acc.childCovered += child;
        acc.coveredValue +=
          adult * adultPrice + juvenile * juvenilePrice + child * childPrice;
        return acc;
      },
      { adultCovered: 0, juvenileCovered: 0, childCovered: 0, coveredValue: 0 },
    );

    const remaining = {
      adult: Math.max(0, event.adultCount - coveredTotals.adultCovered),
      juvenile: Math.max(0, event.juvenileCount - coveredTotals.juvenileCovered),
      child: Math.max(0, event.childCount - coveredTotals.childCovered),
    };

    const remainingValue = usesSections
      ? remaining.adult * updatedPrices.adultPrice +
        remaining.juvenile * updatedPrices.juvenilePrice +
        remaining.child * updatedPrices.childPrice
      : remaining.adult * updatedPrices.pricePerDish;

    const totalAmount = Number((coveredTotals.coveredValue + remainingValue).toFixed(2));

    const updated = await this.prisma.event.update({
      where: { id: event.id },
      data: {
        ...updatedPrices,
        totalAmount,
        lastAdjustmentAt: new Date(),
      },
      include: {
        client: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    return { event: updated, preview };
  }

  async remove(id: string, userId: string) {
    // Verificar que el evento existe y pertenece al usuario
    const event = await this.findOne(id, userId);

    await this.prisma.event.delete({
      where: { id },
    });

    if (event.calendarEventId) {
      try {
        await this.calendarService.deleteEvent(event.calendarEventId);
      } catch (error) {
        this.logger.warn(
          `Calendar delete error: ${(error as Error).message}`,
        );
      }
    }

    return { message: 'Evento eliminado correctamente' };
  }
}
