import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 月間勤怠をCSV形式でエクスポート
     */
    async exportMonthlyAttendanceCSV(userId: string, year: number, month: number): Promise<string> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendances = await this.prisma.attendance.findMany({
            where: {
                userId,
                clockIn: { gte: startDate, lte: endDate },
            },
            include: {
                site: { select: { name: true } },
                workLogs: true,
            },
            orderBy: { clockIn: 'asc' },
        });

        const headers = ['日付', '現場名', '出勤時刻', '退勤時刻', '勤務時間', '作業内容'];
        const rows = attendances.map((a) => {
            const clockIn = new Date(a.clockIn);
            const clockOut = a.clockOut ? new Date(a.clockOut) : null;
            const duration = clockOut
                ? Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60))
                : 0;
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;

            const workTypes = a.workLogs.map((w) => w.workType).join(', ');

            return [
                clockIn.toLocaleDateString('ja-JP'),
                a.site.name,
                clockIn.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                clockOut ? clockOut.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '-',
                `${hours}時間${mins}分`,
                workTypes,
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * 全従業員の月間勤怠をCSV形式でエクスポート（管理者用）
     */
    async exportAllAttendanceCSV(year: number, month: number): Promise<string> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendances = await this.prisma.attendance.findMany({
            where: {
                clockIn: { gte: startDate, lte: endDate },
            },
            include: {
                user: { select: { name: true, email: true } },
                site: { select: { name: true } },
                workLogs: true,
            },
            orderBy: [{ user: { name: 'asc' } }, { clockIn: 'asc' }],
        });

        const headers = ['従業員名', 'メール', '日付', '現場名', '出勤時刻', '退勤時刻', '勤務時間', '作業内容'];
        const rows = attendances.map((a) => {
            const clockIn = new Date(a.clockIn);
            const clockOut = a.clockOut ? new Date(a.clockOut) : null;
            const duration = clockOut
                ? Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60))
                : 0;
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;

            const workTypes = a.workLogs.map((w) => w.workType).join(', ');

            return [
                a.user.name,
                a.user.email,
                clockIn.toLocaleDateString('ja-JP'),
                a.site.name,
                clockIn.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                clockOut ? clockOut.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '-',
                `${hours}時間${mins}分`,
                workTypes,
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * 月間レポートをJSON形式で取得（PDF生成用）
     */
    async getMonthlyReportData(userId: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });

        const attendances = await this.prisma.attendance.findMany({
            where: {
                userId,
                clockIn: { gte: startDate, lte: endDate },
            },
            include: {
                site: { select: { name: true } },
                workLogs: true,
            },
            orderBy: { clockIn: 'asc' },
        });

        let totalMinutes = 0;
        const dailyData = attendances.map((a) => {
            const clockIn = new Date(a.clockIn);
            const clockOut = a.clockOut ? new Date(a.clockOut) : null;
            const duration = clockOut
                ? Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60))
                : 0;
            totalMinutes += duration;

            return {
                date: clockIn.toLocaleDateString('ja-JP'),
                siteName: a.site.name,
                clockIn: clockIn.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                clockOut: clockOut ? clockOut.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : null,
                durationMinutes: duration,
                workTypes: a.workLogs.map((w) => w.workType),
            };
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMins = totalMinutes % 60;

        return {
            user,
            year,
            month,
            totalWorkDays: attendances.length,
            totalWorkTime: `${totalHours}時間${remainingMins}分`,
            totalMinutes,
            averageMinutesPerDay: attendances.length > 0 ? Math.round(totalMinutes / attendances.length) : 0,
            dailyData,
            generatedAt: new Date().toISOString(),
        };
    }
}
