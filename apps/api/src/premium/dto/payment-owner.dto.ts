import { IsUUID } from 'class-validator';

export class PaymentOwnerDto {
  @IsUUID()
  organizerUserId!: string;
}
