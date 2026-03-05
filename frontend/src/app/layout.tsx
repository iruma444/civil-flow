import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, ThemeProvider } from '@/hooks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Civil-Flow | 土木業界向け勤怠管理システム',
    description: '土木現場の作業員と管理者が利用する堅牢でモダンな勤怠管理アプリケーション',
    keywords: '勤怠管理, 土木, 建設, GPS打刻, 日報',
    other: {
        google: 'notranslate',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja" translate="no" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <AuthProvider>{children}</AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

