'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface MonthlyStats {
    year: number;
    month: number;
    totalAttendances: number;
    totalWorkTime: string;
    totalMinutes: number;
    averageMinutesPerDay: number;
    dailyStats: { date: string; minutes: number; count: number }[];
}

interface WorkTypeStat {
    workType: string;
    count: number;
}

const workTypeLabels: Record<string, string> = {
    EXCAVATION: '掘削',
    CONCRETE_POURING: 'コンクリート打設',
    REBAR_WORK: '鉄筋工事',
    FORMWORK: '型枠工事',
    FOUNDATION: '基礎工事',
    PAVING: '舗装',
    DRAINAGE: '排水工事',
    SURVEYING: '測量',
    SAFETY_CHECK: '安全確認',
    CLEANUP: '清掃・片付け',
    OTHER: 'その他',
};

export default function StatisticsPage() {
    const { user, loading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
    const [workTypeStats, setWorkTypeStats] = useState<WorkTypeStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, selectedMonth]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [monthly, workTypes] = await Promise.all([
                api.get<MonthlyStats>(
                    `/statistics/monthly?year=${selectedMonth.year}&month=${selectedMonth.month}`
                ),
                api.get<WorkTypeStat[]>(
                    `/statistics/work-type-stats?year=${selectedMonth.year}&month=${selectedMonth.month}`
                ),
            ]);
            setMonthlyStats(monthly);
            setWorkTypeStats(workTypes);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (delta: number) => {
        setSelectedMonth((prev) => {
            let newMonth = prev.month + delta;
            let newYear = prev.year;
            if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            } else if (newMonth < 1) {
                newMonth = 12;
                newYear -= 1;
            }
            return { year: newYear, month: newMonth };
        });
    };

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}時間${mins}分`;
    };

    const getMaxMinutes = () => {
        if (!monthlyStats?.dailyStats.length) return 480;
        return Math.max(...monthlyStats.dailyStats.map((d) => d.minutes), 480);
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold">📊 統計ダッシュボード</h1>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Month Selector */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" onClick={() => changeMonth(-1)}>
                                ◀ 前月
                            </Button>
                            <span className="text-xl font-bold min-w-[150px] text-center">
                                {selectedMonth.year}年{selectedMonth.month}月
                            </span>
                            <Button variant="outline" onClick={() => changeMonth(1)}>
                                次月 ▶
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg opacity-90">出勤回数</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">
                                        {monthlyStats?.totalAttendances || 0}
                                        <span className="text-xl ml-1">回</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg opacity-90">総勤務時間</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {monthlyStats?.totalWorkTime || '0時間0分'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg opacity-90">平均勤務時間/日</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatMinutes(monthlyStats?.averageMinutesPerDay || 0)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Daily Chart (Simple Bar Chart) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📅 日別勤務時間</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {monthlyStats?.dailyStats && monthlyStats.dailyStats.length > 0 ? (
                                    <div className="space-y-2">
                                        {monthlyStats.dailyStats.map((day) => (
                                            <div key={day.date} className="flex items-center gap-3">
                                                <span className="w-20 text-sm text-muted-foreground shrink-0">
                                                    {day.date.slice(5).replace('-', '/')}
                                                </span>
                                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-end pr-2"
                                                        style={{
                                                            width: `${Math.min(
                                                                (day.minutes / getMaxMinutes()) * 100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs text-white font-medium">
                                                            {formatMinutes(day.minutes)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        この月の勤怠データはありません
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Work Type Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🔧 作業種別内訳</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workTypeStats.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {workTypeStats.map((stat) => (
                                            <div
                                                key={stat.workType}
                                                className="bg-muted rounded-lg p-4 text-center"
                                            >
                                                <div className="text-2xl font-bold text-primary">
                                                    {stat.count}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {workTypeLabels[stat.workType] || stat.workType}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        この月の作業記録はありません
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-16"
                                onClick={() => router.push('/')}
                            >
                                🏠 ホームに戻る
                            </Button>
                            <Button
                                variant="outline"
                                className="h-16"
                                onClick={() => router.push('/leaves')}
                            >
                                🗓️ 休暇申請
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
