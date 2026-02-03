import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 日付フォーマット
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// 時刻フォーマット
export function formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 日時フォーマット
export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 勤務時間計算
export function calculateWorkDuration(clockIn: string, clockOut: string): string {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時間${minutes}分`;
}

// ローカルストレージ操作
export const storage = {
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
    },
    setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('accessToken', token);
    },
    removeToken(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('accessToken');
    },
    getUser(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('user');
    },
    setUser(user: object): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    },
    removeUser(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('user');
    },
    clear(): void {
        this.removeToken();
        this.removeUser();
    },
};
