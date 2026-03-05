'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface LeaveType {
    value: string;
    label: string;
}

interface Leave {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: '申請中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    APPROVED: { label: '承認済', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    REJECTED: { label: '却下', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    CANCELLED: { label: 'キャンセル', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
};

export default function LeavesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'PAID',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leavesData, typesData] = await Promise.all([
                api.get<Leave[]>('/leaves/my'),
                api.get<LeaveType[]>('/leaves/types'),
            ]);
            setLeaves(leavesData);
            setLeaveTypes(typesData);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) return;

        setSubmitting(true);
        try {
            await api.post('/leaves', formData);
            setShowForm(false);
            setFormData({ leaveType: 'PAID', startDate: '', endDate: '', reason: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create leave:', error);
            alert('休暇申請に失敗しました');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId: string) => {
        if (!confirm('この申請をキャンセルしますか？')) return;

        try {
            await api.delete(`/leaves/${leaveId}`);
            fetchData();
        } catch (error) {
            console.error('Failed to cancel leave:', error);
            alert('キャンセルに失敗しました');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold">🗓️ 休暇申請</h1>
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
                {/* New Request Button */}
                <Button
                    className="w-full h-14 text-lg"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ キャンセル' : '＋ 新規申請'}
                </Button>

                {/* Request Form */}
                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>休暇申請フォーム</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">休暇種別</label>
                                    <select
                                        value={formData.leaveType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, leaveType: e.target.value })
                                        }
                                        className="w-full p-3 rounded-lg border bg-background"
                                    >
                                        {leaveTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">開始日</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startDate: e.target.value })
                                            }
                                            className="w-full p-3 rounded-lg border bg-background"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">終了日</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, endDate: e.target.value })
                                            }
                                            className="w-full p-3 rounded-lg border bg-background"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">理由（任意）</label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) =>
                                            setFormData({ ...formData, reason: e.target.value })
                                        }
                                        className="w-full p-3 rounded-lg border bg-background resize-none"
                                        rows={3}
                                        placeholder="休暇の理由を入力してください"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12"
                                    disabled={submitting}
                                >
                                    {submitting ? '送信中...' : '申請する'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Leave History */}
                <Card>
                    <CardHeader>
                        <CardTitle>申請履歴</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                            </div>
                        ) : leaves.length > 0 ? (
                            <div className="space-y-4">
                                {leaves.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {leaveTypes.find((t) => t.value === leave.leaveType)?.label ||
                                                    leave.leaveType}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm ${statusLabels[leave.status]?.color || ''
                                                    }`}
                                            >
                                                {statusLabels[leave.status]?.label || leave.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(leave.startDate)} 〜 {formatDate(leave.endDate)}
                                        </div>
                                        {leave.reason && (
                                            <div className="text-sm bg-muted p-2 rounded">
                                                {leave.reason}
                                            </div>
                                        )}
                                        {leave.status === 'PENDING' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(leave.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                キャンセル
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                休暇申請の履歴はありません
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
