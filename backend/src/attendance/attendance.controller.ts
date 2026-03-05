import { Controller, Post, Get, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto } from './dto/attendance.dto';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.strategy';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('status')
  async getCurrentStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getCurrentStatus(user.id);
  }

  @Post('clock-in')
  async clockIn(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(user.id, dto);
  }

  @Post('clock-out')
  async clockOut(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(user.id, dto);
  }

  @Get('history')
  async getMyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.attendanceService.getMyHistory(user.id, page, limit);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.attendanceService.getAllHistory(page, limit);
  }
}
