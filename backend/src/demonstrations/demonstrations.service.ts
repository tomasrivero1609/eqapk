import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemonstrationDto } from './dto/create-demonstration.dto';

@Injectable()
export class DemonstrationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDemonstrationDto) {
    return this.prisma.demonstrationItem.create({
      data: {
        title: dto.title,
        category: dto.category,
        imageUrl: dto.imageUrl,
        userId,
      },
    });
  }

  async findAll(category?: string) {
    return this.prisma.demonstrationItem.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
