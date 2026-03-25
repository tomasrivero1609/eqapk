import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({ data: dto });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async bulkCreate(items: CreateInventoryItemDto[]) {
    const created = await this.prisma.$transaction(
      items.map((item) => this.prisma.inventoryItem.create({ data: item })),
    );
    return { count: created.length };
  }

  async getCategories(): Promise<string[]> {
    const result = await this.prisma.inventoryItem.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return result.map((r) => r.category).filter(Boolean) as string[];
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.inventoryItem.delete({ where: { id } });
    return { message: 'Item eliminado correctamente' };
  }

  async getMovements(itemId: string) {
    await this.findOne(itemId);
    return this.prisma.inventoryMovement.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMovement(itemId: string, dto: CreateMovementDto) {
    const item = await this.findOne(itemId);

    if (dto.type === MovementType.USO && item.quantity < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${item.quantity}`,
      );
    }

    const delta = dto.type === MovementType.USO ? -dto.quantity : dto.quantity;

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          itemId,
          type: dto.type,
          quantity: dto.quantity,
          notes: dto.notes,
        },
      });

      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: delta } },
      });

      return movement;
    });
  }
}
