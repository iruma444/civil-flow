import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { CurrentUser, Roles } from '../auth/auth.decorators';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('my-attendance-csv')
  async exportMyAttendanceCSV(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;

    const csv = await this.exportService.exportMonthlyAttendanceCSV(user.id, yearNum, monthNum);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_${yearNum}_${monthNum}.csv`,
    );
    // Add BOM for Excel compatibility
    res.send('\uFEFF' + csv);
  }

  @Get('all-attendance-csv')
  @Roles('ADMIN')
  async exportAllAttendanceCSV(
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;

    const csv = await this.exportService.exportAllAttendanceCSV(yearNum, monthNum);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=all_attendance_${yearNum}_${monthNum}.csv`,
    );
    res.send('\uFEFF' + csv);
  }

  @Get('my-report')
  async getMyMonthlyReport(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;

    return this.exportService.getMonthlyReportData(user.id, yearNum, monthNum);
  }
}
