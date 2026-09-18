import { IsUUID } from 'class-validator';

export class EnableConversationDto {
  @IsUUID()
  applicationId!: string;

  /** Só o organizador dono da vaga pode habilitar o chat. */
  @IsUUID()
  organizerUserId!: string;
}
