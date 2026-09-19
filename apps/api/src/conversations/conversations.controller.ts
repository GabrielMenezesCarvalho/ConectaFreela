import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EnableConversationDto } from './dto/enable-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  enable(@Body() dto: EnableConversationDto) {
    return this.conversationsService.enable(dto);
  }

  @Get()
  findForUser(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.conversationsService.findForUser(userId);
  }

  // Declarado antes de @Get(':id'): o Nest casa rotas na ordem, e o ParseUUIDPipe
  // do :id rejeitaria o literal 'unread' com 400.
  @Get('unread')
  unreadSummary(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.conversationsService.unreadSummary(userId);
  }
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.conversationsService.findOne(id, userId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, dto);
  }
}
