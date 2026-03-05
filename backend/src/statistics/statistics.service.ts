import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 月間勤怠サマリー
   */
  async getMonthlyStats(userId: string, role: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const whereClause = role === 'ADMIN' ? {} : { userId };

    const attendances = await this.prisma.attendance.findMany({
      where: {
        ...whereClause,
        clockIn: { gte: startDate, lte: endDate },
        clockOut: { not: null },
      },
      include: {
        user: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
      },
      orderBy: { clockIn: 'desc' },
    });

    // 勤務時間計算
    let totalMinutes = 0;
    const dailyStats: Record<string, { date: string; minutes: number; count: number }> = {};

    for (const att of attendances) {
      if (att.clockOut) {
        const minutes = Math.floor((att.clockOut.getTime() - att.clockIn.getTime()) / (1000 * 60));
        totalMinutes += minutes;

        const dateKey = att.clockIn.toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { date: dateKey, minutes: 0, count: 0 };
        }
        dailyStats[dateKey].minutes += minutes;
        dailyStats[dateKey].count += 1;
      }
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return {
      year,
      month,
      totalAttendances: attendances.length,
      totalWorkTime: `${totalHours}時間${remainingMinutes}分`,
      totalMinutes,
      averageMinutesPerDay:
        attendances.length > 0 ? Math.round(totalMinutes / Object.keys(dailyStats).length) : 0,
      dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
      recentAttendances: attendances.slice(0, 10),
    };
  }

  /**
   * 全体概要（管理者用）
   */
  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeWorkers,
      totalSites,
      activeSites,
      todayAttendances,
      currentlyWorking,
      pendingLeaves,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true, role: 'WORKER' } }),
      this.prisma.site.count(),
      this.prisma.site.count({ where: { isActive: true } }),
      this.prisma.attendance.count({
        where: { clockIn: { gte: today } },
      }),
      this.prisma.attendance.count({
        where: { clockIn: { gte: today }, clockOut: null },
      }),
      this.prisma.leave.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      activeWorkers,
      totalSites,
      activeSites,
      todayAttendances,
      currentlyWorking,
      pendingLeaves,
    };
  }

  /**
   * 現場別稼働統計
   */
  async getSiteStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sites = await this.prisma.site.findMany({
      where: { isActive: true },
      include: {
        attendances: {
          where: {
            clockIn: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    return sites
      .map((site) => {
        let totalMinutes = 0;
        for (const att of site.attendances) {
          if (att.clockOut) {
            totalMinutes += Math.floor(
              (att.clockOut.getTime() - att.clockIn.getTime()) / (1000 * 60),
            );
          }
        }
        return {
          siteId: site.id,
          siteName: site.name,
          attendanceCount: site.attendances.length,
          totalMinutes,
          totalHours: Math.floor(totalMinutes / 60),
        };
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }

  /**
   * 作業種別統計
   */
  async getWorkTypeStats(userId: string, role: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const whereClause = role === 'ADMIN' ? {} : { userId };

    const workLogs = await this.prisma.workLog.groupBy({
      by: ['workType'],
      where: {
        ...whereClause,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { workType: true },
    });

    return workLogs
      .map((wl) => ({
        workType: wl.workType,
        count: wl._count.workType,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
