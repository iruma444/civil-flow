'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface AttendanceRecord {
    id: string;
    clockIn: string;
    clockOut: string | null;
    site: { name: string };
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    attendance: AttendanceRecord | null;
}

export default function CalendarPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchAttendances();
        }
    }, [user, year, month]);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const data = await api.get<AttendanceRecord[]>(
                `/attendance/history?year=${year}&month=${month + 1}`
            );
            setAttendances(data);
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCalendarDays = (): CalendarDay[] => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: CalendarDay[] = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const date = new Date(current);
            const isCurrentMonth = date.getMonth() === month;

            const attendance = attendances.find((a) => {
                const clockIn = new Date(a.clockIn);
                return (
                    clockIn.getFullYear() === date.getFullYear() &&
                    clockIn.getMonth() === date.getMonth() &&
                    clockIn.getDate() === date.getDate()
                );
            });

            days.push({
                date,
                isCurrentMonth,
                attendance: attendance || null,
            });

            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(year, month + delta, 1));
        setSelectedDay(null);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (clockIn: string, clockOut: string | null) => {
        if (!clockOut) return '勤務中';
        const start = new Date(clockIn).getTime();
        const end = new Date(clockOut).getTime();
        const minutes = Math.floor((end - start) / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}時間${mins}分`;
    };

    const days = getCalendarDays();
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

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
            <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold">📅 勤怠カレンダー</h1>
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

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Month Navigation */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => changeMonth(-1)}>
                                ◀
                            </Button>
                            <span className="text-xl font-bold">
                                {year}年{month + 1}月
                            </span>
                            <Button variant="ghost" onClick={() => changeMonth(1)}>
                                ▶
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card>
                    <CardContent className="py-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                            </div>
                        ) : (
                            <>
                                {/* Week days header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day, i) => (
                                        <div
                                            key={day}
                                            className={`text-center text-sm font-medium py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
                                                }`}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((day, index) => {
                                        const isToday =
                                            day.date.toDateString() === new Date().toDateString();
                                        const dayOfWeek = day.date.getDay();

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedDay(day)}
                                                className={`
                          aspect-square p-1 rounded-lg text-sm transition-all
                          ${!day.isCurrentMonth ? 'opacity-30' : ''}
                          ${isToday ? 'ring-2 ring-primary' : ''}
                          ${day.attendance ? 'bg-green-100 dark:bg-green-900' : 'hover:bg-muted'}
                          ${selectedDay?.date.toDateString() === day.date.toDateString() ? 'bg-primary/20' : ''}
                          ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''}
                        `}
                                            >
                                                <div className="font-medium">{day.date.getDate()}</div>
                                                {day.attendance && (
                                                    <div className="text-[10px] text-green-600 dark:text-green-400">●</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Selected Day Details */}
                {selectedDay && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedDay.date.getMonth() + 1}月{selectedDay.date.getDate()}日の勤怠
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDay.attendance ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">現場</span>
                                        <span className="font-medium">{selectedDay.attendance.site.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">出勤</span>
                                        <span className="font-medium text-green-600">
                                            {formatTime(selectedDay.attendance.clockIn)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">退勤</span>
                                        <span className="font-medium text-red-600">
                                            {selectedDay.attendance.clockOut
                                                ? formatTime(selectedDay.attendance.clockOut)
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">勤務時間</span>
                                        <span className="font-bold text-primary">
                                            {calculateDuration(
                                                selectedDay.attendance.clockIn,
                                                selectedDay.attendance.clockOut
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">
                                    この日の勤怠記録はありません
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Legend */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900" />
                                <span>出勤日</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded ring-2 ring-primary" />
                                <span>今日</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14" onClick={() => router.push('/')}>
                        🏠 ホーム
                    </Button>
                    <Button variant="outline" className="h-14" onClick={() => router.push('/statistics')}>
                        📊 統計
                    </Button>
                </div>
            </main>
        </div>
    );
}
