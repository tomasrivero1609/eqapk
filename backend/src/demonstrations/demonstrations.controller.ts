import { Controller, Get, Post, Body, Query, UseGuards, Delete, Param } from '@nestjs/common';
import { DemonstrationsService } from './demonstrations.service';
import { CreateDemonstrationDto } from './dto/create-demonstration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('demonstrations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DemonstrationsController {
  constructor(private readonly demonstrationsService: DemonstrationsService) {}

  @Get()
  @RequirePermission('demostraciones', 'ver')
  findAll(@Query('category') category?: string) {
    return this.demonstrationsService.findAll(category);
  }

  @Post()
  @RequirePermission('demostraciones', 'crear')
  create(@GetUser() user: any, @Body() dto: CreateDemonstrationDto) {
    return this.demonstrationsService.create(user.id, dto);
  }

  @Delete(':id')
  @RequirePermission('demostraciones', 'eliminar')
  remove(@Param('id') id: string) {
    return this.demonstrationsService.remove(id);
  }
}
