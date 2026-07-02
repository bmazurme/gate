import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscriptionPlan } from './enums/subscription-plan.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlanCatalog();
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans/:plan')
  getPlan(@Param('plan') plan: SubscriptionPlan) {
    return this.subscriptionsService.getPlan(plan);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('plans/:plan')
  updatePlan(
    @Param('plan') plan: SubscriptionPlan,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.subscriptionsService.updatePlanPrice(plan, dto.price);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findAllForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/active')
  findMyActive(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findActiveForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.subscribe(user.id, dto.plan);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.subscriptionsService.cancel(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.subscriptionsService.findByIdForUser(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, user.id, dto);
  }
}
