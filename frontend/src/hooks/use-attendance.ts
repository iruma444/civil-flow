'use client';

import { useState, useEffect, useCallback } from 'react';
import { Site, AttendanceStatus } from '@/types';
import { api } from '@/lib';

export function useAttendance() {
    const [status, setStatus] = useState<AttendanceStatus | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const data = await api.get<AttendanceStatus>('/attendance/status');
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch attendance status:', err);
        }
    }, []);

    const fetchSites = useCallback(async () => {
        try {
            const data = await api.get<Site[]>('/sites/active');
            setSites(data);
        } catch (err) {
            console.error('Failed to fetch sites:', err);
        }
    }, []);

    const initialize = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all([fetchStatus(), fetchSites()]);
        } catch (err) {
            setError('データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, [fetchStatus, fetchSites]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const clockIn = useCallback(
        async (siteId: string, latitude: number, longitude: number) => {
            const result = await api.post('/attendance/clock-in', {
                siteId,
                latitude,
                longitude,
            });
            await fetchStatus();
            return result;
        },
        [fetchStatus]
    );

    const clockOut = useCallback(
        async (
            latitude: number,
            longitude: number,
            workLogs: { workType: string; description?: string }[]
        ) => {
            const result = await api.post('/attendance/clock-out', {
                latitude,
                longitude,
                workLogs,
            });
            await fetchStatus();
            return result;
        },
        [fetchStatus]
    );

    return {
        status,
        sites,
        isLoading,
        error,
        clockIn,
        clockOut,
        refresh: initialize,
    };
}
