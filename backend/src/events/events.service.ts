import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
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
    const totalAmount =
      createEventDto.dishCount * createEventDto.pricePerDish;

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        totalAmount,
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
      where: {
        userId,
      },
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

    if (event.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este evento');
    }

    return event;
  }

  async update(id: string, userId: string, updateEventDto: UpdateEventDto) {
    // Verificar que el evento existe y pertenece al usuario
    const event = await this.findOne(id, userId);

    const shouldRecomputeTotal =
      updateEventDto.dishCount !== undefined ||
      updateEventDto.pricePerDish !== undefined;
    const dishCount = updateEventDto.dishCount ?? event.dishCount;
    const pricePerDish =
      updateEventDto.pricePerDish ?? event.pricePerDish;
    const totalAmount = shouldRecomputeTotal
      ? dishCount * pricePerDish
      : event.totalAmount;

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
        ...(shouldRecomputeTotal && { totalAmount }),
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
