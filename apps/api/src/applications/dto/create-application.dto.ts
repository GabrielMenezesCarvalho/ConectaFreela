import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  opportunityId!: string;

  @IsUUID()
  talentUserId!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  message!: string;
}
