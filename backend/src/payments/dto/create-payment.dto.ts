import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Currency } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  eventId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @IsOptional()
  @IsDateString()
  exchangeRateDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  platesCovered?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  adultCovered?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  juvenileCovered?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  childCovered?: number;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
