import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '@prisma/client';

export class ComplementPaymentDto {
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
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ComplementPaymentDto)
  complement?: ComplementPaymentDto;
}
