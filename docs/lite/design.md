# RecruiTrack Lite

「RecruiTrack」の最小構成版として、ToDo 管理に **期限（Due Date）＋リマインダー機能** を追加したプロトタイプです。

---

## 技術スタック

- **Backend**: Hono (TypeScript) + Drizzle ORM
- **Frontend**: Next.js + TypeScript + PWA（Service Worker + 通知 API）
- **DB**: Supabase または PlanetScale (MySQL)
- **Hosting**: Vercel (Frontend) / App Runner など (Backend)
- **CI/CD**: GitHub Actions

---

## 主な機能

1. **ToDo 作成・編集**
  - タイトル
  - 期限日時 (`dueAt`)
  - リマインダーオフセット (`reminderOffset`: 例 24h, 1h)
2. **一覧表示 & フィルタ**
  - 全件／今日中／今週中／期限切れ
  - 各タスクに「期限」「残り時間」「通知ステータス（通知済み／未通知）」を表示
3. **リマインダー通知**
  - バックエンドの CRON／バッチで定期チェック
  - PWA 通知 API またはメール送信で指定時間前にアラート
4. **ステータス管理**
  - `reminded` フラグで「通知済み」を制御し、二重通知を防止

---

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/tamai-hideyuki/recrui-track.git
cd recrui-track-lite
```
2. 環境変数を用意 (.env)
```text
DATABASE_URL="mysql://user:pass@host:port/dbname"
NEXT_PUBLIC_API_URL="https://api.example.com"
MAILER_DSN="smtp://user:pass@smtp.example.com" 
```
3. 依存パッケージをインストール
```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../apps/frontend
npm install
```

4. DB マイグレーション
```bash
cd apps/backend
npx drizzle-kit migrate:dev
```

5. ローカル起動

```bash
# Backend
cd apps/backend
npm run dev

# Frontend
cd ../apps/frontend
npm run dev
```

## API エンドポイント

| メソッド     | パス                         | 説明                                                      |
| -------- | -------------------------- | ------------------------------------------------------- |
| `GET`    | `/api/todos`               | 全 ToDo を取得                                              |
| `GET`    | `/api/todos?filter=<type>` | `all` / `due-today` / `upcoming` / `overdue`            |
| `POST`   | `/api/todos`               | ToDo を新規作成                                              |
|          |                            | Body: `{ title, dueAt, reminderOffset }`                |
| `PATCH`  | `/api/todos/:id`           | ToDo を更新                                                |
|          |                            | Body: `{ title?, dueAt?, reminderOffset?, completed? }` |
| `DELETE` | `/api/todos/:id`           | ToDo を削除                                                |

## フロント画面

1. 作成フォーム
- タイトル入力
- 期限日時ピッカー (<input type="datetime-local">)
- リマインダー選択ドロップダウン（24時間前・1時間前など）

2. 一覧表示
- タスク名
- 期限／残り時間
- 通知ステータスアイコン
- フィルタセレクタ

## リマインダー動作フロー

- バックエンドで CRON ジョブを毎時起動
- dueAt - reminderOffset が現在時刻を過ぎていてかつ reminded = false のレコードを取得
- 通知を送信（メール）
- 対象レコードの reminded を true に更新

## テスト

- ユニットテスト: ドメインモデル／リポジトリ／ユーティリティ関数
- 統合テスト: API エンドポイント
- E2E テスト: 通知トリガーシナリオ

```bash
# Backend
cd apps/backend
npm run test

# Frontend
cd ../apps/frontend
npm run test
```

