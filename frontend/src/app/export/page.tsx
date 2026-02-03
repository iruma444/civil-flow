'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExportPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/export/my-attendance-csv?year=${selectedYear}&month=${selectedMonth}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `勤怠_${selectedYear}年${selectedMonth}月.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('エクスポートに失敗しました');
        } finally {
            setExporting(false);
        }
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/export/my-report?year=${selectedYear}&month=${selectedMonth}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Report fetch failed');

            const data = await response.json();

            // Generate printable HTML report
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('ポップアップがブロックされました');
                return;
            }

            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>月報 - ${data.year}年${data.month}月</title>
          <style>
            body { font-family: 'Hiragino Sans', 'Meiryo', sans-serif; padding: 40px; }
            h1 { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            .summary { background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 2em; font-weight: bold; color: #f97316; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f97316; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 40px; text-align: right; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>📋 勤怠月報</h1>
          <p><strong>${data.user?.name}</strong> - ${data.year}年${data.month}月</p>
          
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">${data.totalWorkDays}</div>
                <div>出勤日数</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${data.totalWorkTime}</div>
                <div>総勤務時間</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${Math.floor(data.averageMinutesPerDay / 60)}h${data.averageMinutesPerDay % 60}m</div>
                <div>平均勤務時間</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>日付</th>
                <th>現場</th>
                <th>出勤</th>
                <th>退勤</th>
                <th>勤務時間</th>
              </tr>
            </thead>
            <tbody>
              ${data.dailyData.map((d: { date: string; siteName: string; clockIn: string; clockOut: string | null; durationMinutes: number }) => `
                <tr>
                  <td>${d.date}</td>
                  <td>${d.siteName}</td>
                  <td>${d.clockIn}</td>
                  <td>${d.clockOut || '-'}</td>
                  <td>${Math.floor(d.durationMinutes / 60)}時間${d.durationMinutes % 60}分</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
            <p>Civil-Flow 勤怠管理システム</p>
          </div>
        </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            console.error('PDF error:', error);
            alert('レポート生成に失敗しました');
        } finally {
            setExporting(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

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
            <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold">📥 データエクスポート</h1>
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
                {/* Period Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>📆 期間選択</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">年</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full p-3 rounded-lg border bg-background"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}年
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">月</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full p-3 rounded-lg border bg-background"
                                >
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}月
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                    <CardHeader>
                        <CardTitle>📂 エクスポート形式</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleExportCSV}
                            disabled={exporting}
                            className="w-full h-16 text-lg bg-blue-500 hover:bg-blue-600"
                        >
                            {exporting ? '処理中...' : '📊 CSVでダウンロード'}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Excelで開けるCSV形式でダウンロードします
                        </p>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card px-4 text-sm text-muted-foreground">または</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            variant="outline"
                            className="w-full h-16 text-lg"
                        >
                            {exporting ? '処理中...' : '🖨️ 印刷用レポートを表示'}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            印刷・PDF保存が可能なレポートを新しいウィンドウで開きます
                        </p>
                    </CardContent>
                </Card>

                {/* Info */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">エクスポートについて</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>CSVは勤怠データの詳細を含みます</li>
                                    <li>印刷用レポートは提出用に最適化されています</li>
                                    <li>PDFとして保存するには印刷ダイアログで「PDFとして保存」を選択</li>
                                </ul>
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
