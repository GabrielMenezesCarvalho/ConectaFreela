import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateTalentProfileDto } from './dto/update-talent-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/talent-profile')
  updateTalentProfile(
    @Param('id') id: string,
    @Body() dto: UpdateTalentProfileDto,
  ) {
    return this.usersService.updateTalentProfile(id, dto);
  }
}
