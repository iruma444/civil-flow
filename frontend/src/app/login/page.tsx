'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { HardHat, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, register, isLoading } = useAuth();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : '認証に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-civil-500 to-civil-700">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-civil-500 via-civil-600 to-civil-800 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-civil-500 p-4 rounded-full">
                            <HardHat className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Civil-Flow
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        土木業界向け勤怠管理システム
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                <AlertCircle className="h-5 w-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {isRegisterMode && (
                            <div className="space-y-2">
                                <Label htmlFor="name">名前</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="山田 太郎"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                        required={isRegisterMode}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@civilflow.jp"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="6文字以上"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? '処理中...'
                                : isRegisterMode
                                    ? 'アカウント作成'
                                    : 'ログイン'}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            {isRegisterMode ? (
                                <>
                                    既にアカウントをお持ちですか？{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegisterMode(false)}
                                        className="text-civil-600 hover:underline font-medium"
                                    >
                                        ログイン
                                    </button>
                                </>
                            ) : (
                                <>
                                    アカウントをお持ちでないですか？{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegisterMode(true)}
                                        className="text-civil-600 hover:underline font-medium"
                                    >
                                        新規登録
                                    </button>
                                </>
                            )}
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
