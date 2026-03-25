import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermission('eventos', 'crear')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(@Query('eventId') eventId?: string) {
    return this.paymentsService.findAll(eventId);
  }

  @Get('summary')
  @RequirePermission('ingresos', 'ver')
  getSummary() {
    return this.paymentsService.getSummary();
  }

  @Delete(':id')
  @RequirePermission('eventos', 'eliminar')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
