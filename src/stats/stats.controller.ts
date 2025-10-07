import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatsService } from './stats.service';
import { CreateQcmAttemptDto } from './dto/create-qcm-attempt.dto';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post('attempts')
  async recordAttempt(@GetUser() user: any, @Body() dto: CreateQcmAttemptDto) {
    return this.statsService.recordAttempt(String(user._id), dto);
  }

  @Get('attempts')
  async listAttempts(@GetUser() user: any, @Query('limit') limit = '20') {
    const parsedLimit = Math.min(
      Math.max(parseInt(String(limit), 10) || 20, 1),
      100,
    );
    return this.statsService.getRecentAttempts(String(user._id), parsedLimit);
  }

  @Get('summary')
  async summary(@GetUser() user: any) {
    return this.statsService.getSummary(String(user._id));
  }
}
