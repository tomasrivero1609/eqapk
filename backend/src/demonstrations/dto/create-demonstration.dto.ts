import { IsString } from 'class-validator';

export class CreateDemonstrationDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  imageUrl: string;
}
