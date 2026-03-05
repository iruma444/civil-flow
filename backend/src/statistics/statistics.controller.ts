import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Roles, CurrentUser } from '../auth/auth.decorators';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('monthly')
  async getMonthlyStats(
    @CurrentUser() user: { id: string; role: string },
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.statisticsService.getMonthlyStats(user.id, user.role, y, m);
  }

  @Get('overview')
  @Roles('ADMIN')
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('site-stats')
  @Roles('ADMIN')
  async getSiteStats(@Query('year') year?: string, @Query('month') month?: string) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.statisticsService.getSiteStats(y, m);
  }

  @Get('work-type-stats')
  async getWorkTypeStats(
    @CurrentUser() user: { id: string; role: string },
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.statisticsService.getWorkTypeStats(user.id, user.role, y, m);
  }
}
