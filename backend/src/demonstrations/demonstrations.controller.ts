import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DemonstrationsService } from './demonstrations.service';
import { CreateDemonstrationDto } from './dto/create-demonstration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('demonstrations')
@UseGuards(JwtAuthGuard)
export class DemonstrationsController {
  constructor(private readonly demonstrationsService: DemonstrationsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.demonstrationsService.findAll(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@GetUser() user: any, @Body() dto: CreateDemonstrationDto) {
    return this.demonstrationsService.create(user.id, dto);
  }
}
