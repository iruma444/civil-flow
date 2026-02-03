'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme, useGeolocation } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface WeatherData {
    temperature: number;
    weatherCode: number;
    weatherDescription: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    icon: string;
}

interface DailyForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    weatherDescription: string;
    icon: string;
}

export default function WeatherPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { location, getCurrentPosition, isLoading: geoLoading } = useGeolocation();
    const router = useRouter();
    const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<DailyForecast[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (location) {
            fetchWeather();
        }
    }, [location]);

    const fetchWeather = async () => {
        if (!location) return;

        setLoading(true);
        setError(null);

        try {
            const data = await api.get<{ current: WeatherData; forecast: DailyForecast[] }>(
                `/weather/site?lat=${location.latitude}&lon=${location.longitude}`
            );
            setCurrentWeather(data.current);
            setForecast(data.forecast);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('天気情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = async () => {
        try {
            await getCurrentPosition();
        } catch (err) {
            setError('位置情報の取得に失敗しました');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
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
            <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>
                        <h1 className="text-xl font-bold">🌤️ 天気情報</h1>
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
                {/* Location Button */}
                {!location && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground mb-4">
                                位置情報を取得して天気を確認しましょう
                            </p>
                            <Button onClick={handleGetLocation} disabled={geoLoading}>
                                {geoLoading ? '取得中...' : '📍 現在地の天気を取得'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-red-500">
                        <CardContent className="py-4 text-center text-red-600">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {/* Current Weather */}
                {currentWeather && (
                    <Card className="bg-gradient-to-br from-sky-400 to-blue-500 text-white overflow-hidden">
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="text-8xl mb-4">{currentWeather.icon}</div>
                                <div className="text-6xl font-bold mb-2">
                                    {Math.round(currentWeather.temperature)}°
                                </div>
                                <div className="text-2xl mb-4">{currentWeather.weatherDescription}</div>
                                <div className="grid grid-cols-3 gap-4 text-sm opacity-90">
                                    <div>
                                        <div className="text-lg">💧</div>
                                        <div>湿度 {currentWeather.humidity}%</div>
                                    </div>
                                    <div>
                                        <div className="text-lg">💨</div>
                                        <div>風速 {currentWeather.windSpeed}m/s</div>
                                    </div>
                                    <div>
                                        <div className="text-lg">🌧️</div>
                                        <div>降水 {currentWeather.precipitation}mm</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Weekly Forecast */}
                {forecast.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>📅 週間予報</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {forecast.map((day, index) => (
                                    <div
                                        key={day.date}
                                        className={`flex items-center justify-between py-3 ${index !== forecast.length - 1 ? 'border-b' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{day.icon}</span>
                                            <div>
                                                <div className="font-medium">{formatDate(day.date)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {day.weatherDescription}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-red-500 font-bold">{Math.round(day.maxTemp)}°</span>
                                            <span className="text-muted-foreground mx-1">/</span>
                                            <span className="text-blue-500">{Math.round(day.minTemp)}°</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Work Safety Tips */}
                {currentWeather && (
                    <Card>
                        <CardHeader>
                            <CardTitle>⚠️ 現場作業の注意点</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {currentWeather.temperature > 30 && (
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <span>🥵</span>
                                        <span>高温注意：こまめな水分補給を心がけてください</span>
                                    </div>
                                )}
                                {currentWeather.temperature < 5 && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <span>🥶</span>
                                        <span>低温注意：防寒対策を徹底してください</span>
                                    </div>
                                )}
                                {currentWeather.precipitation > 0 && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <span>☔</span>
                                        <span>雨天注意：足元に気をつけて作業してください</span>
                                    </div>
                                )}
                                {currentWeather.windSpeed > 10 && (
                                    <div className="flex items-center gap-2 text-yellow-600">
                                        <span>🌬️</span>
                                        <span>強風注意：高所作業は中止を検討してください</span>
                                    </div>
                                )}
                                {currentWeather.temperature >= 5 &&
                                    currentWeather.temperature <= 30 &&
                                    currentWeather.precipitation === 0 &&
                                    currentWeather.windSpeed <= 10 && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <span>✅</span>
                                            <span>作業に適した天候です</span>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14" onClick={() => router.push('/')}>
                        🏠 ホーム
                    </Button>
                    <Button
                        variant="outline"
                        className="h-14"
                        onClick={() => location && fetchWeather()}
                        disabled={!location || loading}
                    >
                        🔄 更新
                    </Button>
                </div>
            </main>
        </div>
    );
}
