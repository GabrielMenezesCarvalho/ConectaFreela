import {
  Body,
  Controller,
  Get,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { UpsertOrganizationDto } from './dto/upsert-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findByOwner(@Query('ownerUserId', ParseUUIDPipe) ownerUserId: string) {
    return this.organizationsService.findByOwner(ownerUserId);
  }

  @Put()
  upsert(@Body() dto: UpsertOrganizationDto) {
    return this.organizationsService.upsert(dto);
  }
}
