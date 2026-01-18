import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishesService {
  constructor(private prisma: PrismaService) {}

  async create(createDishDto: CreateDishDto) {
    return this.prisma.dish.create({
      data: createDishDto,
    });
  }

  async findAll(activeOnly?: boolean) {
    return this.prisma.dish.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: {
        menuDishes: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!dish) {
      throw new NotFoundException('Plato no encontrado');
    }

    return dish;
  }

  async update(id: string, updateDishDto: UpdateDishDto) {
    await this.findOne(id);

    return this.prisma.dish.update({
      where: { id },
      data: updateDishDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - desactivar en lugar de eliminar
    return this.prisma.dish.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
