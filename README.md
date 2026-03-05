# Civil-Flow

土木業界向け勤怠管理システム。GPS打刻・日報・現場管理・CSV出力に対応したフルスタックWebアプリケーション。

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## Architecture

```
civil-flow/
├── frontend/          # Next.js 14 (App Router) + Tailwind CSS
│   └── src/
│       ├── app/       # ページ (login, admin, statistics, calendar, leaves, weather, export, notifications)
│       ├── components/# UI コンポーネント (shadcn/ui ベース)
│       ├── hooks/     # カスタムフック (useAuth, useAttendance, useGeolocation, useTheme)
│       ├── lib/       # API クライアント & ユーティリティ
│       └── types/     # 共有型定義
│
└── backend/           # NestJS 10 + Prisma ORM
    ├── src/
    │   ├── auth/      # JWT 認証 (Passport.js, access token)
    │   ├── users/     # ユーザー管理 (ADMIN / WORKER ロール)
    │   ├── sites/     # 現場管理 (GPS 座標 + 有効半径)
    │   ├── attendance/# 打刻処理 (GPS バリデーション付き出退勤)
    │   ├── work-logs/ # 日報管理 (作業種別ごとのログ)
    │   ├── leaves/    # 休暇申請ワークフロー
    │   ├── notifications/ # 通知システム
    │   ├── statistics/# 集計 API (月次・現場別・作業種別)
    │   ├── weather/   # Open-Meteo API プロキシ
    │   └── export/    # CSV 出力
    └── prisma/
        └── schema.prisma
```

---

## Tech Stack

| レイヤー | 技術 | バージョン |
|----------|------|------------|
| Frontend | Next.js (App Router) | 14 |
| UI | Tailwind CSS + shadcn/ui | - |
| Backend | NestJS | 10 |
| ORM | Prisma | 5 |
| DB (dev) | SQLite | - |
| DB (prod) | PostgreSQL | 14+ |
| 認証 | JWT (Passport.js) | - |
| バリデーション | class-validator | - |
| 外部 API | Open-Meteo (無料・APIキー不要) | - |

---

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Getting Started

```bash
git clone https://github.com/yourusername/civil-flow.git
cd civil-flow
```

### Backend

```bash
cd backend
cp ../.env.example .env   # 環境変数を設定
npm install
npx prisma generate
npx prisma db push
npx prisma db seed        # デモデータ投入（任意）
npm run start:dev
```

## Environment Variables

`.env.example` を参考に `.env` を作成してください。

```env
# backend/.env
DATABASE_URL="file:./dev.db"       # 本番は postgres://...
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

---

## API Overview

### Auth
```
POST /api/auth/register     ユーザー登録
POST /api/auth/login        ログイン → { accessToken, user }
GET  /api/auth/me           ログイン中ユーザー情報 [JWT required]
```

### Attendance
```
GET  /api/attendance/status     現在の出勤状態
POST /api/attendance/clock-in   出勤打刻 (body: { siteId, latitude, longitude })
POST /api/attendance/clock-out  退勤打刻 + 日報 (body: { latitude, longitude, workLogs[] })
GET  /api/attendance/history    勤怠履歴 (pagination対応)
GET  /api/attendance/all        全履歴 [ADMIN]
```

### 他のエンドポイント
```
GET  /api/statistics/monthly         月間サマリー
GET  /api/statistics/overview        全体統計    [ADMIN]
GET  /api/weather/site               現場の天気情報 (latitude, longitude クエリ必須)
GET  /api/leaves/my                  自分の休暇申請一覧
POST /api/leaves                     休暇申請
PUT  /api/leaves/:id/status          承認/却下   [ADMIN]
GET  /api/notifications/my           通知一覧
GET  /api/export/my-attendance-csv   月報CSV出力 (year, month クエリ必須)
```

> 全エンドポイントは `Authorization: Bearer <token>` ヘッダーが必要（`@Public()` 付きを除く）。

---

## Authentication & Authorization

- JWT による Stateless 認証
- `@Public()` デコレータを付けないルートはデフォルトで**認証必須**
- ロールは `ADMIN` / `WORKER` の2種類
- `@Roles(UserRole.ADMIN)` デコレータで ADMIN 専用エンドポイントを保護

---

## GPS Validation

打刻時、リクエストの緯度・経度と現場に登録された座標を比較し、`site.radius`（メートル）以内でなければ 400 を返す。  
距離計算は `Haversine` 公式を使用（`attendance/utils/geo.utils.ts`）。

---

## Database Schema (抜粋)

```prisma
model User        { id, email, password, name, role, isActive }
model Site        { id, name, address, latitude, longitude, radius, isActive }
model Attendance  { id, userId, siteId, clockIn, clockOut, clockIn/OutLat/Lng }
model WorkLog     { id, attendanceId, userId, workType, description }
model Leave       { id, userId, leaveType, startDate, endDate, status }
model Notification / UserNotification
```

---

## Default Seed Users

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@civilflow.jp | admin123 |
| WORKER | yamada@civilflow.jp | worker123 |
| WORKER | tanaka@civilflow.jp | worker123 |

> **本番環境ではシードデータを削除し、パスワードを必ず変更してください。**

---

## Contributing

1. Fork → feature branch 作成 (`git checkout -b feature/xxx`)
2. コミット (`git commit -m 'feat: xxx'`)
3. Push → Pull Request

---

## License

MIT
