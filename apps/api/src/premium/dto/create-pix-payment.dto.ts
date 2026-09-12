import { IsUUID } from 'class-validator';

export class CreatePixPaymentDto {
  @IsUUID()
  organizerUserId!: string;
}
