import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @RequirePermission('inventario', 'crear')
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Post('bulk')
  @RequirePermission('inventario', 'crear')
  bulkCreate(@Body() items: CreateInventoryItemDto[]) {
    return this.inventoryService.bulkCreate(items);
  }

  @Get()
  @RequirePermission('inventario', 'ver')
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('categories')
  @RequirePermission('inventario', 'ver')
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Get(':id')
  @RequirePermission('inventario', 'ver')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('inventario', 'editar')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('inventario', 'eliminar')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Get(':id/movements')
  @RequirePermission('inventario', 'ver')
  getMovements(@Param('id') id: string) {
    return this.inventoryService.getMovements(id);
  }

  @Post(':id/movements')
  @RequirePermission('inventario', 'crear')
  createMovement(@Param('id') id: string, @Body() dto: CreateMovementDto) {
    return this.inventoryService.createMovement(id, dto);
  }
}
