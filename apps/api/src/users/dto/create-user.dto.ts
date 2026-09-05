import { UserRole } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @ValidateIf((dto: CreateUserDto) => dto.role === UserRole.TALENT)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skills?: string[];

  @ValidateIf((dto: CreateUserDto) => dto.role === UserRole.TALENT)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  availability?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_protocol: true }, { each: true })
  portfolioLinks?: string[];
}
