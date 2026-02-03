// ユーザーロール
export type UserRole = 'ADMIN' | 'WORKER';

// ユーザー
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// 認証レスポンス
export interface AuthResponse {
    accessToken: string;
    user: User;
}

// 現場
export interface Site {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// 現場（稼働人数付き）
export interface SiteWithWorkerCount extends Site {
    currentWorkerCount: number;
}

// 作業種別
export type WorkType =
    | 'EXCAVATION'
    | 'CONCRETE_POURING'
    | 'REBAR_WORK'
    | 'FORMWORK'
    | 'FOUNDATION'
    | 'PAVING'
    | 'DRAINAGE'
    | 'SURVEYING'
    | 'SAFETY_CHECK'
    | 'CLEANUP'
    | 'OTHER';

// 作業種別ラベル
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
    EXCAVATION: '掘削',
    CONCRETE_POURING: 'コンクリート打設',
    REBAR_WORK: '鉄筋工事',
    FORMWORK: '型枠工事',
    FOUNDATION: '基礎工事',
    PAVING: '舗装',
    DRAINAGE: '排水工事',
    SURVEYING: '測量',
    SAFETY_CHECK: '安全確認',
    CLEANUP: '清掃・片付け',
    OTHER: 'その他',
};

// 日報
export interface WorkLog {
    id: string;
    attendanceId: string;
    userId: string;
    workType: WorkType;
    description?: string;
    createdAt: string;
}

// 勤怠記録
export interface Attendance {
    id: string;
    userId: string;
    siteId: string;
    clockIn: string;
    clockOut: string | null;
    clockInLat: number;
    clockInLng: number;
    clockOutLat?: number;
    clockOutLng?: number;
    site?: Site;
    user?: User;
    workLogs?: WorkLog[];
}

// 出勤状態
export interface AttendanceStatus {
    isClockedIn: boolean;
    attendance: {
        id: string;
        clockIn: string;
        site: Site;
    } | null;
}

// GPS位置情報
export interface Location {
    latitude: number;
    longitude: number;
}

// APIレスポンス共通
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

// エラーレスポンス
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}

// ページネーション
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}
