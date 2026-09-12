import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get('talents/:talentUserId')
  findByTalent(@Param('talentUserId', ParseUUIDPipe) talentUserId: string) {
    return this.applicationsService.findByTalent(talentUserId);
  }

  @Get('talents/:talentUserId/opportunities/:opportunityId')
  findForTalentAndOpportunity(
    @Param('talentUserId', ParseUUIDPipe) talentUserId: string,
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
  ) {
    return this.applicationsService.findForTalentAndOpportunity(
      talentUserId,
      opportunityId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto);
  }

  @Patch(':id/withdraw')
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WithdrawApplicationDto,
  ) {
    return this.applicationsService.withdraw(id, dto);
  }
}
