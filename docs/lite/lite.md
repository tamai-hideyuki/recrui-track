# 📘 RecruiTrack Lite - 転職ToDo管理プロトタイプ

**RecruiTrack Lite** は、「転職活動に必要な行動（ToDo）」を一元管理するための極小構成プロダクトです。  
バックエンドに **Hono × Drizzle ORM** を用いることで、**高速起動・型安全・拡張可能なAPI** を実現しています。

---

## 🎯 目的

- 転職活動のタスク（企業調査・面談準備など）を可視化
- 自身の行動記録としても使える
- シンプルながらも設計思想・運用力・実行力をアピールできる構成

---

## 🔧 技術構成

| 層        | 技術               | 補足                                |
|-----------|--------------------|-------------------------------------|
| Frontend  | Next.js (TypeScript) | 仮UI or 後日実装                    |
| API Server| Hono (TypeScript)  | 軽量ルーティング                    |
| ORM       | Drizzle ORM        | 型安全なSQLライク操作               |
| DB        | SQLite（or Supabase） | drizzle-kit で自動マイグレーション |
| Infra     | Docker + Nginx + EC2 | モノレポで一括管理・配備            |

---

## 🏗 ディレクトリ構成（モノレポ）

- `./apps/backend`
```text
  apps/backend/
  ├── src/
  │   ├── domain/
  │   │   └── todo.ts
  │   ├── infra/
  │   │   ├── db.ts          # drizzle 初期化
  │   │   └── schema.ts      # drizzle schema 定義
  │   ├── routes/
  │   │   └── todos.ts       # /api/todos エンドポイント
  │   └── index.ts           # Hono app 起動エントリ
  ├── drizzle.config.ts      # drizzle CLI 設定
  ├── package.json
  └── tsconfig.json
```
- ./apps/frontend  
```text
apps/frontend/
├── pages/
│   └── index.tsx         # ToDo一覧と登録画面
├── lib/
│   └── api.ts            # /api/todos との通信
├── types/
│   └── todo.ts           # 共通型定義（必要に応じて backend と共有も可）
├── package.json
└── tsconfig.json
```

- ./.github/workflows/deploy.yml

- 必要な GitHub Secrets:
  - EC2_SSH_PRIVATE_KEY
  - EC2_HOST

## 実装の特徴
- 型安全なDB操作：Drizzle による schema-first 設計
- ドメイン分離：Entity と Route/API を明確に分離
- 即デプロイ可能：Docker & EC2 によるスムーズな環境移行
- 将来の拡張容易：企業別ログ、ステータス管理、認証対応にも展開可能

## EC2 デプロイ手順

```bash
# 1. ローカル → EC2 へ一括転送
scp -r ./recrui-track ec2-user@<EC2-IP>:~

# 2. EC2 で起動
ssh ec2-user@<EC2-IP>
cd ~/recrui-track
docker-compose down
docker-compose up -d --build

```

### .github/workflows/deploy.yml
```yaml
name: RecruiTrack Lite 自動デプロイ

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: EC2転送 & Docker起動
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        uses: actions/checkout@v3

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.EC2_SSH_PRIVATE_KEY }}

      - name: Copy files to EC2
        run: |
          rsync -avz \
            --exclude '.git' \
            --exclude 'node_modules' \
            --exclude 'drizzle' \
            --exclude '.env' \
            ./ ec2-user@${{ secrets.EC2_HOST }}:/home/ec2-user/recrui-track

      - name: Restart Docker Compose on EC2
        run: |
          ssh ec2-user@${{ secrets.EC2_HOST }} << 'EOF'
            cd /home/ec2-user/recrui-track
            docker-compose down
            docker-compose up -d --build
          EOF

```
