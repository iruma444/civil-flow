'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAttendance, useGeolocation, useTheme } from '@/hooks';
import { WorkType, WORK_TYPE_LABELS, Site } from '@/types';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import {
    Clock,
    MapPin,
    HardHat,
    LogOut,
    Building2,
    CheckCircle,
    AlertCircle,
    Loader2,
    Navigation,
    BarChart3,
    Calendar,
    Bell,
    Moon,
    Sun,
} from 'lucide-react';
import { formatTime, formatDateTime } from '@/lib';

export default function HomePage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const { status, sites, isLoading: attendanceLoading, clockIn, clockOut, refresh } = useAttendance();
    const { location, error: geoError, isLoading: geoLoading, getCurrentPosition } = useGeolocation();
    const { theme, toggleTheme } = useTheme();

    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);
    const [workDescription, setWorkDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // 管理者は管理画面へリダイレクト
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            router.push('/admin');
        }
    }, [user, router]);

    const handleClockIn = async () => {
        if (!selectedSiteId) {
            setMessage({ type: 'error', text: '現場を選択してください' });
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            const pos = await getCurrentPosition();
            await clockIn(selectedSiteId, pos.latitude, pos.longitude);
            setMessage({ type: 'success', text: '出勤しました！' });
            setSelectedSiteId('');
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : '出勤に失敗しました',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClockOut = async () => {
        if (selectedWorkTypes.length === 0) {
            setMessage({ type: 'error', text: '作業内容を1件以上選択してください' });
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            const pos = await getCurrentPosition();
            const workLogs = selectedWorkTypes.map((workType) => ({
                workType,
                description: workDescription || undefined,
            }));
            await clockOut(pos.latitude, pos.longitude, workLogs);
            setMessage({ type: 'success', text: '退勤しました！お疲れ様でした。' });
            setSelectedWorkTypes([]);
            setWorkDescription('');
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : '退勤に失敗しました',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleWorkType = (workType: WorkType) => {
        setSelectedWorkTypes((prev) =>
            prev.includes(workType)
                ? prev.filter((t) => t !== workType)
                : [...prev, workType]
        );
    };

    if (authLoading || attendanceLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-civil-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const isClockedIn = status?.isClockedIn ?? false;
    const currentAttendance = status?.attendance;

    return (
        <div className="min-h-screen bg-background">
            {/* ヘッダー */}
            <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HardHat className="h-6 w-6" />
                        <span className="font-bold text-lg">Civil-Flow</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/notifications')}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* ステータス表示 */}
                <Card className={isClockedIn ? 'border-green-500 border-2' : ''}>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isClockedIn
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">
                                    {isClockedIn ? '勤務中' : '未出勤'}
                                </span>
                            </div>

                            {isClockedIn && currentAttendance && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-gray-600">
                                        <Building2 className="h-4 w-4" />
                                        <span className="font-medium">{currentAttendance.site.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        出勤時刻: {formatTime(currentAttendance.clockIn)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* GPS状態 */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-full ${location ? 'bg-green-100' : geoError ? 'bg-red-100' : 'bg-gray-100'
                                    }`}
                            >
                                <Navigation
                                    className={`h-5 w-5 ${location
                                        ? 'text-green-600'
                                        : geoError
                                            ? 'text-red-600'
                                            : 'text-gray-400'
                                        }`}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">位置情報</p>
                                <p className="text-xs text-gray-500">
                                    {geoLoading
                                        ? '取得中...'
                                        : location
                                            ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                                            : geoError || '位置情報を取得できません'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => getCurrentPosition()}
                                disabled={geoLoading}
                            >
                                更新
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* メッセージ表示 */}
                {message && (
                    <div
                        className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <AlertCircle className="h-5 w-5" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* 出勤・退勤コントロール */}
                {!isClockedIn ? (
                    /* 出勤コントロール */
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-civil-500" />
                                出勤する現場を選択
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="現場を選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map((site: Site) => (
                                        <SelectItem key={site.id} value={site.id}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleClockIn}
                                disabled={!selectedSiteId || isProcessing || geoLoading}
                                variant="success"
                                size="xl"
                                className="w-full"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <Clock className="h-5 w-5 mr-2" />
                                )}
                                出勤する
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    /* 退勤コントロール */
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-civil-500" />
                                本日の作業内容
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((workType) => (
                                    <button
                                        key={workType}
                                        onClick={() => toggleWorkType(workType)}
                                        className={`p-3 text-sm rounded-lg border transition-all ${selectedWorkTypes.includes(workType)
                                            ? 'bg-civil-500 text-white border-civil-500'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-civil-300'
                                            }`}
                                    >
                                        {WORK_TYPE_LABELS[workType]}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                placeholder="作業詳細（任意）"
                                value={workDescription}
                                onChange={(e) => setWorkDescription(e.target.value)}
                                className="w-full p-3 border rounded-lg resize-none h-24"
                            />

                            <Button
                                onClick={handleClockOut}
                                disabled={selectedWorkTypes.length === 0 || isProcessing || geoLoading}
                                variant="destructive"
                                size="xl"
                                className="w-full"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <LogOut className="h-5 w-5 mr-2" />
                                )}
                                退勤する
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* ナビゲーションリンク */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                    <button
                        onClick={() => router.push('/statistics')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <BarChart3 className="h-6 w-6 text-blue-500" />
                        <span className="text-xs font-medium">統計</span>
                    </button>
                    <button
                        onClick={() => router.push('/calendar')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <Calendar className="h-6 w-6 text-teal-500" />
                        <span className="text-xs font-medium">カレンダー</span>
                    </button>
                    <button
                        onClick={() => router.push('/weather')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <span className="text-2xl">🌤️</span>
                        <span className="text-xs font-medium">天気</span>
                    </button>
                    <button
                        onClick={() => router.push('/leaves')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <span className="text-2xl">🗓️</span>
                        <span className="text-xs font-medium">休暇申請</span>
                    </button>
                    <button
                        onClick={() => router.push('/export')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <span className="text-2xl">📥</span>
                        <span className="text-xs font-medium">エクスポート</span>
                    </button>
                    <button
                        onClick={() => router.push('/notifications')}
                        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
                    >
                        <Bell className="h-6 w-6 text-purple-500" />
                        <span className="text-xs font-medium">お知らせ</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
