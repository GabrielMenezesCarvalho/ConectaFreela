import { IsUUID } from 'class-validator';

export class FeatureOpportunityDto {
  @IsUUID()
  organizerUserId!: string;
}
