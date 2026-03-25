import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
