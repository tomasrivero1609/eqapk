import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class MenuDishDto {
  @IsString()
  dishId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsArray()
  @IsOptional()
  dishes?: MenuDishDto[];
}
