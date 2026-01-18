import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { dishes, ...menuData } = createMenuDto;

    const menu = await this.prisma.menu.create({
      data: {
        ...menuData,
        menuDishes: dishes
          ? {
              create: dishes.map((dish) => ({
                dishId: dish.dishId,
                quantity: dish.quantity,
              })),
            }
          : undefined,
      },
      include: {
        menuDishes: {
          include: {
            dish: true,
          },
        },
      },
    });

    return menu;
  }

  async findAll(activeOnly?: boolean) {
    return this.prisma.menu.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        menuDishes: {
          include: {
            dish: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        menuDishes: {
          include: {
            dish: true,
          },
        },
        eventMenus: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu no encontrado');
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    await this.findOne(id);

    const { dishes, ...menuData } = updateMenuDto;

    if (dishes) {
      await this.prisma.menuDish.deleteMany({
        where: { menuId: id },
      });
    }

    return this.prisma.menu.update({
      where: { id },
      data: {
        ...menuData,
        menuDishes: dishes
          ? {
              create: dishes.map((dish) => ({
                dishId: dish.dishId,
                quantity: dish.quantity,
              })),
            }
          : undefined,
      },
      include: {
        menuDishes: {
          include: {
            dish: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.menu.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
