# 🏗️ Civil-Flow

**土木業界向けモダン勤怠管理システム**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## ✨ 特徴

- 📍 **GPS打刻** - 位置情報を自動取得して不正打刻を防止
- 🌤️ **天気連携** - 現場の天気情報をリアルタイム表示（Open-Meteo API）
- 📊 **統計ダッシュボード** - 月間勤怠サマリーと日別チャート
- 📅 **勤怠カレンダー** - 出勤日をわかりやすく可視化
- 🗓️ **休暇管理** - 有給・病欠・代休の申請と承認ワークフロー
- 📥 **エクスポート** - CSV/PDF形式で月報出力
- 🌙 **ダークモード** - 目に優しい夜間モード
- 📱 **PWA対応** - スマホのホーム画面から起動可能
- 🔔 **通知機能** - 管理者からのお知らせを即時配信

---

## 🚀 クイックスタート

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/civil-flow.git
cd civil-flow

# バックエンドのセットアップ
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev

# 別ターミナルでフロントエンド起動
cd frontend
npm install
npm run dev
```

### アクセス

| サービス | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

---

## 📁 プロジェクト構成

```
civil-flow/
├── frontend/              # Next.js フロントエンド
│   ├── src/
│   │   ├── app/           # App Router ページ
│   │   │   ├── statistics/   # 統計ダッシュボード
│   │   │   ├── calendar/     # 勤怠カレンダー
│   │   │   ├── weather/      # 天気情報
│   │   │   ├── leaves/       # 休暇申請
│   │   │   ├── export/       # エクスポート
│   │   │   ├── notifications/# 通知
│   │   │   └── admin/        # 管理者画面
│   │   ├── components/    # 再利用可能なUIコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── lib/           # ユーティリティ関数
│   │   └── types/         # 型定義
│   └── public/            # 静的ファイル
│
├── backend/               # NestJS バックエンド
│   ├── src/
│   │   ├── auth/          # 認証モジュール (JWT)
│   │   ├── users/         # ユーザー管理
│   │   ├── sites/         # 現場管理
│   │   ├── attendance/    # 勤怠記録
│   │   ├── work-logs/     # 作業記録
│   │   ├── statistics/    # 統計API
│   │   ├── leaves/        # 休暇管理
│   │   ├── notifications/ # 通知機能
│   │   ├── weather/       # 天気API連携
│   │   ├── export/        # エクスポート機能
│   │   └── prisma/        # データベース
│   └── prisma/
│       └── schema.prisma
│
└── README.md
```

---

## 🔌 API エンドポイント

### 認証
| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/auth/register` | ユーザー登録 |
| POST | `/api/auth/login` | ログイン |
| GET | `/api/auth/me` | 現在のユーザー情報 |

### 勤怠
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/attendance/status` | 勤務状態取得 |
| POST | `/api/attendance/clock-in` | 出勤打刻 |
| POST | `/api/attendance/clock-out` | 退勤打刻 |
| GET | `/api/attendance/history` | 勤怠履歴 |

### 統計
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/statistics/monthly` | 月間サマリー |
| GET | `/api/statistics/overview` | 全体統計 |
| GET | `/api/statistics/site-stats` | 現場別統計 |
| GET | `/api/statistics/work-type-stats` | 作業種別統計 |

### 天気
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/weather/current` | 現在の天気 |
| GET | `/api/weather/forecast` | 週間予報 |
| GET | `/api/weather/site` | 現場天気（両方取得） |

### 休暇
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/leaves/types` | 休暇種別一覧 |
| POST | `/api/leaves` | 休暇申請 |
| GET | `/api/leaves/my` | 自分の申請一覧 |
| PUT | `/api/leaves/:id/status` | 承認/却下 |

### 通知
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/notifications/my` | 自分の通知一覧 |
| GET | `/api/notifications/unread-count` | 未読数 |
| PUT | `/api/notifications/:id/read` | 既読化 |

### エクスポート
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/export/my-attendance-csv` | CSV出力 |
| GET | `/api/export/my-report` | レポートデータ |

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**

### バックエンド
- **NestJS 10**
- **Prisma ORM**
- **SQLite** (開発) / **PostgreSQL** (本番)
- **JWT認証**
- **class-validator**

### 外部API
- **Open-Meteo** - 天気情報（無料、APIキー不要）

---

## 👤 デフォルトユーザー

| 役割 | メール | パスワード |
|------|--------|-----------|
| 管理者 | admin@civilflow.jp | admin123 |
| 作業員 | yamada@civilflow.jp | worker123 |
| 作業員 | tanaka@civilflow.jp | worker123 |

---

## 📄 ライセンス

MIT License

---

## 🤝 コントリビュート

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📞 お問い合わせ

ご質問やフィードバックがあれば、Issueを作成してください。
