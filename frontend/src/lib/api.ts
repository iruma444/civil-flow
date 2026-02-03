import { ApiResponse, ApiError } from '@/types';
import { storage } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(options?: FetchOptions): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (!options?.skipAuth) {
            const token = storage.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const data = await response.json();

        if (!response.ok) {
            const error = data as ApiError;
            throw new Error(error.error?.message || 'APIリクエストに失敗しました');
        }

        return (data as ApiResponse<T>).data;
    }

    async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(options),
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(options),
            body: JSON.stringify(body),
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(options),
            body: JSON.stringify(body),
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(options),
            ...options,
        });
        return this.handleResponse<T>(response);
    }
}

export const api = new ApiClient(API_BASE_URL);
