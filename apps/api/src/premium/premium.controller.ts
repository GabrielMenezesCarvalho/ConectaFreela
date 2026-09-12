import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { PaymentOwnerDto } from './dto/payment-owner.dto';
import { PremiumService } from './premium.service';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Get('organizers/:userId/subscription')
  findForOrganizer(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.premiumService.findForOrganizer(userId);
  }

  @Post('payments/pix')
  createPixPayment(@Body() dto: CreatePixPaymentDto) {
    return this.premiumService.createPixPayment(dto);
  }

  @Get('payments/:id/status')
  checkPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizerUserId', ParseUUIDPipe) organizerUserId: string,
  ) {
    return this.premiumService.checkPayment(id, organizerUserId);
  }

  @Post('payments/:id/simulate')
  simulatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PaymentOwnerDto,
  ) {
    return this.premiumService.simulatePayment(id, dto.organizerUserId);
  }
}
