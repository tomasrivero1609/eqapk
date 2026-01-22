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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@GetUser() user: any, @Body() createEventDto: CreateEventDto) {
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
  ) {
    if (!date) {
      throw new BadRequestException('Falta la fecha');
    }
    return this.eventsService.checkAvailability(date, eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Post(':id/quarterly-adjustment')
  quarterlyAdjustment(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body('apply') apply?: boolean,
    @Body('force') force?: boolean,
  ) {
    if (apply) {
      return this.eventsService.applyQuarterlyAdjustment(id, user.id, force);
    }
    return this.eventsService.previewQuarterlyAdjustment(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.eventsService.remove(id, user.id);
  }
}
