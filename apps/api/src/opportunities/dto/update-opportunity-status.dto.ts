import { OpportunityStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class UpdateOpportunityStatusDto {
  @IsUUID()
  organizerUserId!: string;

  @IsEnum(OpportunityStatus)
  status!: OpportunityStatus;
}
