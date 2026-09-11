import { ApplicationStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsUUID()
  organizerUserId!: string;

  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
