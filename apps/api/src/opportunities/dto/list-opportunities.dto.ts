import { OpportunityStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListOpportunitiesDto {
  /** Quando informado, devolve as vagas desse organizador em qualquer status. */
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;
}
