import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  senderUserId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}
