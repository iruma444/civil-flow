'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Notification {
    id: string;
    notificationId: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'REMINDER';
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

const typeStyles: Record<string, { icon: string; color: string }> = {
    INFO: { icon: 'ℹ️', color: 'border-l-blue-500' },
    WARNING: { icon: '⚠️', color: 'border-l-yellow-500' },
    ALERT: { icon: '🚨', color: 'border-l-red-500' },
    REMINDER: { icon: '🔔', color: 'border-l-purple-500' },
};

export default function NotificationsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const [notifs, countData] = await Promise.all([
                api.get<Notification[]>('/notifications/my'),
                api.get<{ count: number }>('/notifications/unread-count'),
            ]);
            setNotifications(notifs);
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await api.put(`/notifications/${notificationId}/read`, {});
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === notificationId
                        ? { ...n, isRead: true, readAt: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all', {});
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 7) return `${diffDays}日前`;
        return date.toLocaleDateString('ja-JP');
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
            <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            🔔 お知らせ
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
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
                {/* Mark All as Read */}
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={markAllAsRead}
                    >
                        すべて既読にする
                    </Button>
                )}

                {/* Notifications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>通知一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`border-l-4 ${typeStyles[notif.type]?.color || 'border-l-gray-500'
                                            } bg-muted/50 rounded-r-lg p-4 cursor-pointer transition-opacity ${notif.isRead ? 'opacity-60' : ''
                                            }`}
                                        onClick={() => !notif.isRead && markAsRead(notif.notificationId)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span>{typeStyles[notif.type]?.icon || '📢'}</span>
                                                <span className="font-medium">{notif.title}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {formatDate(notif.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 ml-6">
                                            {notif.content}
                                        </p>
                                        {!notif.isRead && (
                                            <div className="mt-2 ml-6">
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    未読
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                お知らせはありません
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="h-14"
                        onClick={() => router.push('/')}
                    >
                        🏠 ホーム
                    </Button>
                    <Button
                        variant="outline"
                        className="h-14"
                        onClick={() => router.push('/statistics')}
                    >
                        📊 統計
                    </Button>
                </div>
            </main>
        </div>
    );
}
