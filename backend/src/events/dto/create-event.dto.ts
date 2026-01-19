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
}
