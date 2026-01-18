import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { eventId, items, notes } = createOrderDto;

    // Verificar que el evento existe
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Calcular total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Crear orden con items
    const order = await this.prisma.order.create({
      data: {
        eventId,
        total,
        notes,
        items: {
          create: items.map((item) => ({
            eventId,
            dishId: item.dishId || null,
            menuId: item.menuId || null,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            dish: true,
            menu: true,
          },
        },
        event: true,
      },
    });

    return order;
  }

  async findAll(eventId?: string) {
    return this.prisma.order.findMany({
      where: eventId ? { eventId } : undefined,
      include: {
        items: {
          include: {
            dish: true,
            menu: true,
          },
        },
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            dish: true,
            menu: true,
          },
        },
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            dish: true,
            menu: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.order.delete({
      where: { id },
    });

    return { message: 'Orden eliminada correctamente' };
  }
}
