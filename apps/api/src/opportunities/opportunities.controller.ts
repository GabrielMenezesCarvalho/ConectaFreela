import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { FeatureOpportunityDto } from './dto/feature-opportunity.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import { UpdateOpportunityStatusDto } from './dto/update-opportunity-status.dto';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get()
  findAll(@Query() query: ListOpportunitiesDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Get(':id/applications')
  findApplications(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizerUserId', ParseUUIDPipe) organizerUserId: string,
  ) {
    return this.applicationsService.findByOpportunity(id, organizerUserId);
  }

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityStatusDto,
  ) {
    return this.opportunitiesService.updateStatus(id, dto);
  }

  @Patch(':id/feature')
  feature(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FeatureOpportunityDto,
  ) {
    return this.opportunitiesService.feature(id, dto);
  }
}
