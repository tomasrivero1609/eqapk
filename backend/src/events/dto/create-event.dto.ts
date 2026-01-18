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
  @Min(1)
  guestCount: number;

  @IsInt()
  @Min(1)
  dishCount: number;

  @IsNumber()
  @Min(0)
  pricePerDish: number;

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
