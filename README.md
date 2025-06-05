[このリポジトリ作成を通して再学習すること](#このリポジトリ作成を通して再学習すること)

## [RecruiTrack Lite](docs/lite/lite.md)
※フルバージョンを作成すると時間がかかりすぎるので一旦最小構成で作成

# 📁 RecruiTrack (recrui-track)

「あなたの転職活動を、戦略的に・効率的に・確実に。」

---

## 🌟 概要

**RecruiTrack**（リクルトラック）は、転職活動を記録・分析・改善するための**自己管理ツール**です。

面接や面談の予定管理、企業ごとのステータスを可視化、履歴書などの書類アップロード、自己分析や振り返りログなどを一元管理できます。

> 🧠 自分だけの「転職ダッシュボード」を持ち、選考を可視化することで、不安を自信に変える。

---


## 🚀 主な機能（予定）

| 機能カテゴリ        | 内容                                                                 |
|---------------------|----------------------------------------------------------------------|
|  スケジュール管理    | 面談・面接の予定とToDoを可視化し、Google Calendarとも連携予定                      |
|  応募企業・書類管理 | 応募先企業のステータス管理、履歴書・職務経歴書のアップロード・バージョン管理など        |
| ️ 自己分析・振り返り | 面接後の気づき、反省点、次への改善点を記録・分類                                  |
|  ダッシュボード    | 応募状況や選考ステータスをグラフ表示、自己評価の進捗可視化                            |


---

## 🏗 技術スタック

| 区分           | 技術                                 |
|----------------|--------------------------------------|
| Frontend       | [Next.js](https://nextjs.org/) + TypeScript |
| Backend        | [Hono](https://hono.dev/) + [Drizzle ORM](https://orm.drizzle.team/) |
| Database       | [Supabase](https://supabase.com/) または [PlanetScale](https://planetscale.com/) |
| Hosting        | Vercel / AWS（App Runner, S3, Route 53） |
| Auth           | OAuth（Google認証）                     |


---

## 🧱 アーキテクチャ

- DDD（ドメイン駆動設計）
- レイヤードアーキテクチャ + クリーンアーキテクチャ
- Monorepo構成（`apps/frontend`, `apps/api`, `packages/core`）

---


## このリポジトリ作成を通して再学習すること
# 1. アーキテクチャ・設計パターン

## 1.1 SOLID 原則
- **Single Responsibility Principle (SRP)**  
  クラスやモジュールは「たった一つの責務」を持つ。
- **Open-Closed Principle (OCP)**  
  既存のコードを変更せずに、拡張だけで振る舞いを追加できる。
- **Liskov Substitution Principle (LSP)**  
  派生クラスは基底クラスの代替として問題なく動くこと。
- **Interface Segregation Principle (ISP)**  
  クライアント（呼び出し側）が使わないメソッドを持たない、小粒度のインターフェースを設計する。
- **Dependency Inversion Principle (DIP)**  
  高水準モジュールは低水準モジュールに依存せず、両者とも抽象（インターフェース）に依存する。

DDD やレイヤードをきちんと機能させるには、このあたりの原則を押さえておくと、自ずと層ごとの責務分離が明確になる。

## 1.2 Hexagonal Architecture（ポート＆アダプタ）
- **概要**  
  コアのビジネスロジック（ドメイン／ユースケース）を中心におき、「外部インターフェース（Web, CLI, DB, メッセージキューなど）」をポート／アダプタとして差し替えられるように設計する手法。
- **RecruiTrack での利用例**
    - `src/domain`＋`src/usecases` が「アーキテクチャの heart」
    - HTTP, DB, メール通知などをすべて「アダプタ」として切り出し、DI コンテナ経由で注入
    - テスト時は「アダプタをモック」にすることで、ビジネスロジック単体を完全に切り離しやすい

## 1.3 CQRS（Command Query Responsibility Segregation）
- **概要**  
  「データを変更する操作（Command）」と「読み取る操作（Query）」を完全に分離するパターン。
- **メリット**
    - 読み取り専用モデルを最適化できる（たとえばキャッシュやビュー用 DB）
    - 書き込み側はドメインロジックに集中でき、テストも容易
- **RecruiTrack での適用イメージ**
    - **Command 側**：面談登録・企業ステータス変更・タスク完了など（ユースケース層の Interactor）
    - **Query 側**：ダッシュボード用の集計クエリ（KPI、グラフ用）を専用リポジトリで最適設計
    - たとえば `InterviewWriteService` vs `InterviewReadRepository` のようにクラスを分ける

## 1.4 Event Sourcing／Domain Events
- **概要**  
  エンティティの状態変化を「イベントのストリーム」として永続化し、現在状態をイベント再生で再構築する。
- **メリット**
    - どの時点で誰が何をしたかが完全に再現可能 → 履歴トレースが強化
    - イベントをトリガーに別処理（通知、分析、キャッシュ更新など）を連携しやすい
- **RecruiTrack での検討例**
    - 面談ステータス変更時に `InterviewStatusChangedEvent` を発行 → `NotificationHandler` が Slack 通知
    - 「面接合格」「不合格」などを Domain Event として発行し、KPI 集計用バッチで集約
    - （ただし初期フェーズは複雑度が増すので、イベントストアは要検討）

## 1.5 Repository + Unit of Work パターン
- **概要**
    - **Repository**：ドメインの永続化操作を抽象化し、CRUD を隠蔽
    - **Unit of Work**：トランザクション境界をひとまとめに管理し、複数のリポジトリをまたいだコミットを一元管理
- **RecruiTrack での利用例**
    - 複数テーブルをまたぐ面談作成フローで、`InterviewRepository` と `CompanyRepository` の両方を同じトランザクションで処理したいときに `UnitOfWork` を使う
    - Drizzle ORM や Prisma でも「セッション or トランザクション管理」を `UnitOfWork` 風にラップすると扱いやすい

---

# 2. 設計／実装支援ライブラリ・フレームワーク

## 2.1 バックエンドフレームワーク
- **Hono (https://hono.dev/)**
    - Node.js/TypeScript 向け軽量マイクロフレームワーク
    - 高速かつミドルウェア設計がシンプル → クリーンアーキテクチャ向けにルーティング＋ミドルウェアを組み合わせやすい
- **Fastify (https://www.fastify.io/)**
    - 高速な HTTP サーバー／プラグインエコシステムが充実
    - JSON スキーマバリデーションが組み込み
- **NestJS (https://nestjs.com/)**
    - DI/モジュールシステム／GraphQL など機能が豊富
    - クリーンアーキテクチャや DDD を導入しやすい一方、Learning Curve はやや高め

> ※RecruiTrack では軽量な Hono × Drizzle ORM をベースにしていますが、将来的に機能拡張が大きくなる場合は NestJS への移行検討もあり

## 2.2 ORM／データアクセス
- **Drizzle ORM (https://orm.drizzle.team/)**
    - TypeScript ネイティブに最適化された型安全なクエリビルダー
    - マイグレーションは `drizzle-kit` で管理
- **Prisma (https://www.prisma.io/)**
    - スキーマ駆動型でマイグレーション・型生成が自動化
    - リポジトリパターンを適用しつつ、Raw SQL が必要な場合も `prisma.$queryRaw` で実行可
- **TypeORM / Sequelize**
    - 歴史が長く成熟しているが、型安全性は Prisma / Drizzle ほどではない

## 2.3 バリデーション／スキーマ
- **Zod (https://zod.dev/)**
    - バリデーションスキーマを TypeScript 型と一元管理できる
    - API リクエストの検証、ユースケースへの DTO 生成に適用しやすい
- **Class-Validator + Class-Transformer**
    - デコレータベースで DTO へバリデーション定義が可能
    - NestJS や TypeORM と相性が良い

## 2.4 依存注入（DI）
- **Tsyringe (https://github.com/microsoft/tsyringe)**
    - コンストラクタインジェクションベースのシンプルな DI コンテナ
    - `@injectable()`, `@inject()` デコレータで依存解決
- **InversifyJS (https://inversify.io/)**
    - インターフェースバインディングやスコープ管理など、機能が豊富
    - 大規模プロジェクト向きだが、設定量が多め
- **自作 DI（軽量ラッパー）**
    - 小規模〜中規模なら、最小限のファクトリパターンで済ませることも可

## 2.5 認証・認可
- **Passport.js (https://www.passportjs.org/)**
    - Google OAuth など主要プロバイダーと連携しやすい
    - JWT ストラテジー、セッションストラテジーなどをプラグインで追加
- **NextAuth.js (https://next-auth.js.org/)**
    - Next.js 側のフロント／バックエンドでシームレスに OAuth を実現
    - RecruiTrack のフロントエンド（Next.js）にも統合しやすい
- **JWT (jsonwebtoken)**
    - 独自実装でシンプルにトークン発行・検証したい場合
    - リフレッシュトークン管理やブラックリスト管理は別途実装が必要

## 2.6 フロントエンドライブラリ・フレームワーク
- **Next.js (https://nextjs.org/)**
    - React ベースのフルスタックフレームワーク
    - API Routes も使えるので、バックエンドと一緒にリポジトリ管理しやすい
- **React + Vite**
    - 単純にフロントだけ切り離したい場合に有効
    - SWC ベースの高速ビルド
- **状態管理**
    - **Zustand (https://github.com/pmndrs/zustand)**：単純かつ型安全なグローバルステート管理
    - **Redux Toolkit (https://redux-toolkit.js.org/)**：中大規模なアプリ向け、高機能・ミドルウェア拡張が容易
- **UI コンポーネント**
    - **Tailwind CSS (https://tailwindcss.com/)**：ユーティリティファーストで柔軟なスタイリング
    - **shadcn/ui (https://ui.shadcn.com/)**：Tailwind とコンポーネントライブラリを組み合わせたセット
    - **Chakra UI / Material UI**：完成度の高いデザインシステムをすぐ使いたい場合

## 2.7 グラフ描画・可視化
- **Recharts (https://recharts.org/)**
    - React コンポーネントとして簡単にグラフを描画
    - Line, Bar, Pie, Radar など主要チャートが標準搭載
- **Chart.js + react-chartjs-2 (https://www.chartjs.org/)**
    - 汎用性の高いチャートライブラリ。カスタマイズ性も豊富
- **D3.js (https://d3js.org/)**
    - もっと独自の可視化を作り込みたい場合に本格的な低レイヤーチャートを実装可能
- **visx (https://airbnb.io/visx/)**
    - React で D3 のローパワーな部分を使いたい場合に最適

---

# 3. テスト・CI/CD

## 3.1 テストフレームワーク
- **Jest (https://jestjs.io/)**
    - ドメインユニットテスト／ユースケース単体テストに最適
    - モック機能・スナップショットテストも充実
- **Vitest (https://vitest.dev/)**
    - Vite ベースのプロジェクトと相性抜群。高速なテスト実行が可能
    - Jest ライクな API を提供
- **Playwright / Cypress (https://playwright.dev/ / https://www.cypress.io/ )**
    - フロントエンドの E2E テスト・UI テスト
    - ログインフローや実際のダッシュボード表示を自動で検証

## 3.2 CI/CD ツール
- **GitHub Actions**
    - GitHub リポジトリと直結してワークフローを定義
    - プッシュ → テスト → ビルド → デプロイ の自動化が容易
- **CircleCI / Travis CI**
    - 設定 YAML ベースで複雑なパイプラインを組みたい場合に有効
- **Terraform / Pulumi**
    - AWS リソース（App Runner, S3, IAM, RDS など）のインフラコード化
    - DevOps 的に環境をコードで管理し、ステージング・本番を同一定義にできる

---

# 4. ドキュメント・API 設計

## 4.1 OpenAPI (Swagger)
- **概要**
    - API 仕様を YAML/JSON で定義し、Swagger UI でドキュメントを自動生成
    - フロントエンド開発者とも「エンドポイント仕様」を共有しやすい
- **RecruiTrack での活用例**
    - `docs/swagger.yaml` にエンドポイント一覧・リクエスト／レスポンス例をまとめる
    - CI 時に `openapi-validator` でスキーマチェックを行う

## 4.2 Typedoc / JSDoc
- **概要**
    - TypeScript のソースドキュメントを自動生成
    - ドメイン層のクラスやユースケースクラスに JSDoc コメントを残すことで、API コールチェーンを把握しやすくなる

---

# 5. インフラ・デプロイ関連

## 5.1 コンテナ化・コンテナオーケストレーション
- **Docker / docker-compose**
    - 開発環境の再現性を高めるための標準
    - `docker-compose` で API, DB, Redis, Message Queue を一気に起動
- **Kubernetes (EKS / GKE / AKS)**
    - スケーラビリティを重視する場合は、マイクロサービスを Pod 単位でスケール
    - `Helm` Chart を使えば複雑な設定もテンプレート化

## 5.2 クラウドサービス
- **AWS (App Runner, ECS, S3, RDS, CloudFront, Route 53)**
    - App Runner や ECS+Fargate で API をコンテナデプロイ
    - S3 + CloudFront でフロントエンドをホスティング
    - RDS（MySQL / Aurora）でスケーラブルな DB 運用
- **Supabase / Firebase**
    - もしフルサーバーレスで進めたい場合は、Supabase Auth / Database / Edge Functions を活用
    - RecruiTrack の場合、独自ドメイン + App Runner を選択しているので、Supabase はバックアップ的な選択肢として検討可
- **PlanetScale**
    - 高可用性・スケーラビリティが強みの MySQL 互換クラウド DB
    - 「ワンクリックでブランチを切れる」機能があるため、Feature Branch ごとに DB 環境を用意しやすい

---

# 6. 運用・監視

## 6.1 ロギング・トレース
- **Winston / Pino**
    - 構造化ログを出力しやすく、Sentry や Datadog に流し込むときに便利
    - リクエストごとに一意のトレース ID を付与し、ログの相関を取りやすくする
- **OpenTelemetry (OTel)**
    - 分散トレーシングを導入し、リクエストのレイテンシやボトルネックを可視化
- **Sentry / Datadog**
    - エラーやパフォーマンス異常をリアルタイムにアラート
    - クライアント（フロント）・サーバー（バック）両方の例外を集約可能

## 6.2 メトリクス・アラート
- **Prometheus + Grafana**
    - API のリクエスト数、レイテンシ、DB クエリ時間などを収集して可視化
    - アラートルールを設定し、閾値超過時に Slack 通知
- **AWS CloudWatch**
    - App Runner / ECS / RDS などのメトリクスメトリクスを集約
    - CloudWatch Alarm で簡単に CPU/メモリ異常を検知

---

# 7. テストデータ・モックツール

## 7.1 Mocking／Stub
- **MSW (Mock Service Worker, https://mswjs.io/ )**
    - フロントエンドで API モックを立てる際に便利。実際のネットワーク呼び出しをインターセプトして疑似レスポンスを返す
- **WireMock / LocalStack**
    - 外部サービス（S3, SNS, SQS など）をローカルでモックするためのツールセット

---

# 8. その他の概念・手法

## 8.1 TDD / BDD（テスト駆動開発／振る舞い駆動開発）
- **TDD**
    - まずユースケースやドメインサービスのテストを Red → Green → Refactor のサイクルで書く
    - バグを未然に防ぎながら、設計を進化させる
- **BDD**
    - ユーザーストーリーやユースケースを Given/When/Then で記述し、ドキュメントとしても活用
    - Cucumber や Jest でシナリオテストを書くことも可

## 8.2 マイクロサービス vs モノリス
- **モノリシック構成（Monolith）**
    - 初期リリースでは、バックエンドを単一リポジトリ・単一 API サーバーで組むと開発が速い
    - リポジトリ内をドメインごとにモジュール分割し、後からマイクロサービス化しやすい構成を意識
- **マイクロサービス構成**
    - ユーザー認証／面談管理／ダッシュボード集計などを別サービス化すると、チーム分業やスケールが容易
    - ただし運用コスト・CI/CD 設定は複雑化するため、初期は「モノリス + 機能モジュール分割」を推奨

## 8.3 Domain-Driven Design（DDD） の深化
- **Boundary, Entity, Value Object, Aggregate, Repository, Service, Specification パターン**
    - 各要素をもう一段階深掘りし、ドメインモデルの整合性を高める
- **Specification パターン**
    - 複雑な検索条件をオブジェクト化して再利用しやすくする
    - 例：`InterviewByDateRangeSpecification`, `CompanyByStatusSpecification` など

## 8.4 API セキュリティ
- **OWASP Top 10**
    - XSS, SQL Injection, CSRF などへの対策を必ずチェック
    - 入出力バリデーション、プリペアドステートメントの徹底、CORS 設定など
- **Rate Limiting / Throttling**
    - クライアントごとにリクエスト閾値を設定し、DDoS 攻撃や不正利用を抑制
    - `express-rate-limit` などのミドルウェア／Hono のプラグインを活用

---

# まとめ

RecruiTrack を **「DDD + レイヤード + クリーンアーキテクチャ」** で構築する際に、以下のような周辺概念・フレームワークを組み合わせることで、より堅牢かつ拡張性・保守性の高いシステムが実現できる。

1. **設計原則**：SOLID、Hexagonal、CQRS、Event Sourcing
2. **バックエンド基盤**：Hono／Fastify／NestJS、Drizzle ORM／Prisma、Zod／Class-Validator、Tsyringe／Inversify
3. **認証・認可**：Passport.js／NextAuth.js、JWT
4. **フロントエンド**：Next.js／React + Vite、Zustand／Redux、Tailwind CSS＋shadcn/ui
5. **グラフ描画**：Recharts／Chart.js／D3
6. **テスト・CI/CD**：Jest／Vitest／Playwright、GitHub Actions／CircleCI、Terraform／Pulumi
7. **ドキュメント**：OpenAPI／Swagger、Typedoc／JSDoc
8. **インフラ**：Docker, Kubernetes, AWS (App Runner, S3, RDS, Route 53, CloudFront)、Supabase / PlanetScale
9. **監視・ログ**：Winston／Pino、OpenTelemetry、Sentry、Prometheus＋Grafana
10. **その他**：TDD/BDD、Specification パターン、マイクロサービス化の検討、OWASP セキュリティ対策

