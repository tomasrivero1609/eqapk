import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EventStatus, Currency } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsInt()
  @Min(0)
  guestCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dishCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDish?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  adultCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  juvenileCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  childCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adultPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  juvenilePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  childPrice?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quarterlyAdjustmentPercent?: number;

  @IsOptional()
  @IsString()
  menuDescription?: string;

  @IsOptional()
  @IsString()
  eventHours?: string;

  @IsOptional()
  @IsString()
  receptionType?: string;

  @IsOptional()
  @IsString()
  courseCountAdult?: string;

  @IsOptional()
  @IsString()
  courseCountJuvenile?: string;

  @IsOptional()
  @IsString()
  courseCountChild?: string;

  @IsOptional()
  @IsString()
  islandType?: string;

  @IsOptional()
  @IsString()
  dessert?: string;

  @IsOptional()
  @IsString()
  sweetTable?: string;

  @IsOptional()
  @IsString()
  partyEnd?: string;

  @IsOptional()
  @IsString()
  specialDishes?: string;

  @IsOptional()
  @IsString()
  cake?: string;

  @IsOptional()
  @IsString()
  familyMembers?: string;

  @IsOptional()
  @IsString()
  hallSetupDescription?: string;

  @IsOptional()
  @IsString()
  tablecloth?: string;

  @IsOptional()
  @IsString()
  tableNumbers?: string;

  @IsOptional()
  @IsString()
  centerpieces?: string;

  @IsOptional()
  @IsString()
  souvenirs?: string;

  @IsOptional()
  @IsString()
  bouquet?: string;

  @IsOptional()
  @IsString()
  candles?: string;

  @IsOptional()
  @IsString()
  charms?: string;

  @IsOptional()
  @IsString()
  roses?: string;

  @IsOptional()
  @IsString()
  cotillon?: string;

  @IsOptional()
  @IsString()
  photographer?: string;

  @IsOptional()
  @IsString()
  optionalContracted?: string;
}
