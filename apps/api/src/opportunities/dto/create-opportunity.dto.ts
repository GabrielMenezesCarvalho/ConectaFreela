import { Modality, OpportunityType } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOpportunityDto {
  @IsUUID()
  createdByUserId!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  description!: string;

  @IsEnum(OpportunityType)
  type!: OpportunityType;

  @IsEnum(Modality)
  modality!: Modality;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  weeklyHours?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills!: string[];
}
