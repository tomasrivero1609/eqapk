import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, string[]>;
}

export class ChangePasswordDto {
  @IsString()
  password: string;
}
