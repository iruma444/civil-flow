'use client';

import { useState, useCallback, useEffect } from 'react';
import { Location } from '@/types';

interface GeolocationState {
    location: Location | null;
    error: string | null;
    isLoading: boolean;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const [state, setState] = useState<GeolocationState>({
        location: null,
        error: null,
        isLoading: false,
    });

    const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options;

    const getCurrentPosition = useCallback(() => {
        return new Promise<Location>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('お使いのブラウザは位置情報に対応していません'));
                return;
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: Location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setState({ location, error: null, isLoading: false });
                    resolve(location);
                },
                (error) => {
                    let errorMessage = '位置情報の取得に失敗しました';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = '位置情報の使用が許可されていません。設定から許可してください。';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = '位置情報を取得できませんでした。';
                            break;
                        case error.TIMEOUT:
                            errorMessage = '位置情報の取得がタイムアウトしました。';
                            break;
                    }
                    setState({ location: null, error: errorMessage, isLoading: false });
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy,
                    timeout,
                    maximumAge,
                }
            );
        });
    }, [enableHighAccuracy, timeout, maximumAge]);

    // 初回マウント時に位置情報を取得試行
    useEffect(() => {
        getCurrentPosition().catch(() => {
            // 初回は失敗しても問題ない（権限確認のため）
        });
    }, [getCurrentPosition]);

    return {
        ...state,
        getCurrentPosition,
    };
}
