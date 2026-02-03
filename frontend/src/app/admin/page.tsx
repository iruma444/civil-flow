'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { SiteWithWorkerCount } from '@/types';
import { api, formatDate } from '@/lib';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
} from '@/components/ui';
import {
    HardHat,
    LogOut,
    Users,
    Building2,
    MapPin,
    RefreshCw,
    Loader2,
    LayoutDashboard,
} from 'lucide-react';

interface ActiveWorker {
    attendanceId: string;
    clockIn: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const [sites, setSites] = useState<SiteWithWorkerCount[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [activeWorkers, setActiveWorkers] = useState<ActiveWorker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            const data = await api.get<SiteWithWorkerCount[]>('/sites/dashboard');
            setSites(data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchDashboard();
        }
    }, [isAuthenticated, user, fetchDashboard]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDashboard();
        setIsRefreshing(false);
    };

    const handleViewWorkers = async (siteId: string) => {
        if (selectedSiteId === siteId) {
            setSelectedSiteId(null);
            setActiveWorkers([]);
            return;
        }

        setSelectedSiteId(siteId);
        try {
            const workers = await api.get<ActiveWorker[]>(`/sites/${siteId}/workers`);
            setActiveWorkers(workers);
        } catch (error) {
            console.error('Failed to fetch workers:', error);
            setActiveWorkers([]);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-civil-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null;
    }

    const totalWorkers = sites.reduce((sum, site) => sum + site.currentWorkerCount, 0);
    const activeSites = sites.filter((site) => site.currentWorkerCount > 0).length;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HardHat className="h-8 w-8 text-civil-500" />
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">Civil-Flow</h1>
                            <p className="text-xs text-gray-500">管理者ダッシュボード</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            更新
                        </Button>
                        <span className="text-sm text-gray-600">{user?.name}</span>
                        <button
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* サマリーカード */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-civil-500 to-civil-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-civil-100 text-sm">総稼働人数</p>
                                    <p className="text-4xl font-bold">{totalWorkers}人</p>
                                </div>
                                <Users className="h-12 w-12 text-civil-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">稼働中の現場</p>
                                    <p className="text-4xl font-bold">{activeSites}件</p>
                                </div>
                                <Building2 className="h-12 w-12 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">登録現場数</p>
                                    <p className="text-4xl font-bold">{sites.length}件</p>
                                </div>
                                <LayoutDashboard className="h-12 w-12 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 現場一覧 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-civil-500" />
                            現場別稼働状況
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sites.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">現場が登録されていません</p>
                            ) : (
                                sites.map((site) => (
                                    <div key={site.id} className="border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => handleViewWorkers(site.id)}
                                            className="w-full text-left"
                                        >
                                            <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800">{site.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{site.address}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            工期: {formatDate(site.startDate)} 〜{' '}
                                                            {site.endDate ? formatDate(site.endDate) : '未定'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`inline-flex items-center gap-1 px-4 py-2 rounded-full ${site.currentWorkerCount > 0
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-500'
                                                                }`}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                            <span className="font-bold text-xl">{site.currentWorkerCount}</span>
                                                            <span className="text-sm">人</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* 作業員詳細（展開時） */}
                                        {selectedSiteId === site.id && (
                                            <div className="border-t bg-white p-4">
                                                {activeWorkers.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-4">
                                                        現在この現場に作業員はいません
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                                            稼働中の作業員
                                                        </p>
                                                        {activeWorkers.map((worker) => (
                                                            <div
                                                                key={worker.attendanceId}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-civil-100 rounded-full flex items-center justify-center">
                                                                        <span className="text-civil-600 font-medium">
                                                                            {worker.user.name.charAt(0)}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-800">{worker.user.name}</p>
                                                                        <p className="text-xs text-gray-500">{worker.user.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right text-sm text-gray-500">
                                                                    <p>出勤</p>
                                                                    <p className="font-medium text-gray-700">
                                                                        {new Date(worker.clockIn).toLocaleTimeString('ja-JP', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
