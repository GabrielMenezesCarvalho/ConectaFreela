import { IsUUID } from 'class-validator';

export class WithdrawApplicationDto {
  @IsUUID()
  talentUserId!: string;
}
