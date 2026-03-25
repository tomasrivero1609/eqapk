import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

const EVENT_TYPE_MODULE_MAP: Record<string, string> = {
  SALON: 'eventos',
  VISITA: 'entrevistas',
  FRANCO: 'francos',
};

function checkPermission(user: any, module: string, action: string) {
  if (user.role === 'SUPERADMIN') return;
  const perms = user.permissions?.[module];
  if (!perms || !Array.isArray(perms) || !perms.includes(action)) {
    throw new ForbiddenException('No tienes permiso para esta acción');
  }
}

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@GetUser() user: any, @Body() createEventDto: CreateEventDto) {
    const mod = EVENT_TYPE_MODULE_MAP[createEventDto.eventType || 'SALON'] || 'eventos';
    checkPermission(user, mod, 'crear');
    return this.eventsService.create(user.id, createEventDto);
  }

  @Get()
  findAll(@GetUser() user: any) {
    return this.eventsService.findAll(user.id);
  }

  @Get('availability')
  checkAvailability(
    @Query('date') date: string,
    @Query('eventId') eventId?: string,
    @Query('eventType') eventType?: string,
  ) {
    if (!date) {
      throw new BadRequestException('Falta la fecha');
    }
    return this.eventsService.checkAvailability(date, eventId, eventType);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.findOne(id, user.id);
    const mod = EVENT_TYPE_MODULE_MAP[event.eventType || 'SALON'] || 'eventos';
    checkPermission(user, mod, 'editar');
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Post(':id/quarterly-adjustment')
  quarterlyAdjustment(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body('apply') apply?: boolean,
    @Body('force') force?: boolean,
  ) {
    checkPermission(user, 'eventos', 'editar');
    if (apply) {
      return this.eventsService.applyQuarterlyAdjustment(id, user.id, force);
    }
    return this.eventsService.previewQuarterlyAdjustment(id, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    const event = await this.eventsService.findOne(id, user.id);
    const mod = EVENT_TYPE_MODULE_MAP[event.eventType || 'SALON'] || 'eventos';
    checkPermission(user, mod, 'eliminar');
    return this.eventsService.remove(id, user.id);
  }
}
