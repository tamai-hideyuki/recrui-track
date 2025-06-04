#### レイヤーアーキテクチャと責務範囲

# Layers (アーキテクチャ層)

## 🎯 目的
- 各レイヤーが担う責務を明確化し、**依存関係のルール**を定める
- DDD／クリーンアーキテクチャに基づいて、モジュール分割を行うことで **保守性・拡張性** を確保する
- 仕様（ユースケース）から実装までの流れをスムーズにし、**チーム開発** での役割分担を容易にする

---

## 📊 全体構成イメージ

```text
┌──────────────────────────────┐
│    Infrastructure Layer      │  ← 外部サービス連携・DB, Cache, 外部API 呼び出し
│ (インフラ層／Framework & API)  │
└───────────↓──────────────────┘
            │
┌──────────────────────────────┐
│   Application Layer          │  ← コントローラ、ルーティング、DTO、Adapter 等
│ (アプリケーション層／Interface) │
└───────────↓──────────────────┘
            │
┌──────────────────────────────┐
│     Use Case Layer           │  ← ユースケース／ビジネスフロー（Interactor）
│ (ユースケース層／Service)      │
└───────────↓──────────────────┘
            │
┌──────────────────────────────┐
│      Domain Layer            │  ← エンティティ、値オブジェクト、ドメインサービス
│ (ドメイン層／Entity & VO)      │
└──────────────────────────────┘
```
#### 依存ルール
1. Infrastructure → Application → Use Case → Domain
2. 下位レイヤー（右側）は上位レイヤー（左側）へ依存しない
3. 各レイヤー間はインターフェースを通じて結合し、具体実装の置き換えを容易にする

---

## 1. Domain Layer（ドメイン層）

### 📝 責務
- ビジネスルールやドメイン知識を純粋に表現する
- エンティティ（Entity）や値オブジェクト（Value Object）を定義し、**業務ロジック** を持つ
- ドメインサービス（Domain Service）が必要な場合はこの層に配置
- リポジトリインターフェース（Repository Interface）を宣言し、**インフラ層への依存を排除**する

### 📦 主なコンポーネント
- **エンティティ（例：Interview, Company, User, Document, Task, EmotionRecord, KPI）**
    - 識別子（UUID）、属性（文字列・日付など）を保持
    - 関連するビジネスロジックやバリデーションを持つ
- **値オブジェクト（例：ScheduleTime, Status, Tag, EmotionScore）**
    - 不変（Immutable）で、小粒度の概念を定義
    - 複数のエンティティで使い回し可能
- **ドメインサービス**
    - エンティティ単体では表現しにくいビジネス処理を定義（例：選考ステータスの遷移検証ロジック）
- **リポジトリインターフェース**
    - 保存・検索・削除などの操作を抽象化したメソッド群
    - 例：`InterviewRepository`, `CompanyRepository`, `EmotionRecordRepository` など

### 🔍 依存関係
- **外部依存なし**（純粋なビジネスロジック層）
- リポジトリインターフェースのみ、上位の Use Case 層から呼び出される  

---

## 2. Use Case Layer（ユースケース層）

### 📝 責務
- 「ユースケース」単位でのビジネスフローを実装
- ドメイン層のエンティティ／ドメインサービス／リポジトリインターフェースを組み合わせて、業務要件を実現する
- 入力値のバリデーションやトランザクション管理を行い、**正常フロー／例外フロー** を定義
- 出力データ（DTO）を形成し、上位（Application 層）へ返却

### 📦 主なコンポーネント
- **Interactor（ユースケースクラス）**
    - 例：`CreateInterviewUseCase`, `UpdateCompanyStatusUseCase`, `FetchKpiDashboardUseCase`など
    - メソッド単位で 1 つのユースケース（例：`execute(inputDto): outputDto`）を実装
- **入出力 DTO（Data Transfer Object）**
    - 入力用 DTO：外部から渡された生データを Use Case 内で扱いやすい形に変換
    - 出力用 DTO：レスポンスや画面表示用に、ドメイン情報を整形して返却
- **ユースケースユニットテスト**
    - 正常系・例外系を網羅し、ドメイン層との結合を検証
    - 外部インフラへの依存はモック化して、ビジネスロジックのみをテスト

### 🔍 依存関係
- **Domain Layer（ドメイン層）**
- **Repository Interface**（ドメイン層で定義された依存先を、インジェクションで受け取る）

---

## 3. Application Layer（アプリケーション層／Interface 層）

### 📝 責務
- Web API や CLI／外部インターフェースに対する **エントリポイント** を提供
- HTTP リクエスト → Use Case への呼び出し → HTTP レスポンス の流れを実現
- 認証・認可（Authentication/Authorization）のチェック
- 各種ミドルウェア（例：ログ出力、エラーハンドリング、CORS 設定）を適用
- プレゼンテーション層としての役割を担い、**ViewModel**（画面用に成形した出力 DTO）を生成

### 📦 主なコンポーネント
- **コントローラ（Controller）／ハンドラ（Handler）**
    - 例：`InterviewController`, `CompanyController`, `AuthController`
    - リクエストを受け取り、Use Case のインタラクターに渡す
    - レスポンスとしてステータスコード・JSON を返却
- **ルーティング設定**
    - Hono (または他のフレームワーク) によるエンドポイント定義
    - 例：`GET /api/interviews`, `POST /api/interviews`, `PUT /api/companies/:id/status`
- **認証・認可機構**
    - `AuthMiddleware`：Google OAuth トークン検証、JWT 検証など
    - `PermissionGuard`：ユーザー権限チェック
- **入力バリデーション**
    - JSON スキーマやクラスバリデータを使い、リクエストボディを検証
    - バリデーションエラー時に一貫したエラーフォーマットで返却
- **レスポンスシリアライザ**
    - ドメインの出力 DTO → JSON 形式への変換、必要に応じてフィールド制限

### 🔍 依存関係
- **Use Case Layer（ユースケース層）**
- **Infrastructure Layer（インフラ層）**（認証情報や設定値などを注入）

---

## 4. Infrastructure Layer（インフラ層／Framework & Drivers）

### 📝 責務
- **永続化（Persistence）**：データベース（Supabase / PlanetScale / MySQL など）への接続・ORM 設定
- **外部サービス連携**：Google OAuth、メール配信サービス、SNS 通知（Slack/LINE）
- **キャッシュ／キュー**：Redis、メッセージキュー (AWS SQS など) の設定・操作
- **外部APIクライアント**：企業ニュース自動収集 API、LINE 通知 API、Google カレンダー同期
- **物理的インフラ設定**：Docker コンテナ設定、CI/CD（GitHub Actions）、環境変数管理

### 📦 主なコンポーネント
- **リポジトリ実装（Repository Implementation）**
    - 例：`PrismaInterviewRepository`, `DrizzleCompanyRepository`
    - ドメイン層で宣言したリポジトリインターフェースを具体実装
    - ORM（Prisma / Drizzle ORM）を使って SQL クエリを発行
- **DB マイグレーション設定**
    - Drizzle のスキーマ定義、マイグレーションファイル管理
    - `drizzle-kit` や `knex` などを利用したバージョン管理
- **外部APIクライアント**
    - `GoogleOAuthClient`, `SlackNotifier`, `NewsFetcherClient` など
    - HTTP クライアント（Axios / fetch）をラップして再利用性を高める
- **依存注入コンテナの設定**
    - `Tsyringe` / `Inversify` / 自作 DI コンテナで、各インターフェースに具体実装を紐づけ
- **共有ライブラリ・共通ユーティリティ**
    - ロガー設定 (Winston / pino)、エラーハンドリングユーティリティ、環境変数管理 (`dotenv`)

### 🔍 依存関係
- **Application Layer（アプリケーション層）** から呼び出される
- 担当するドメインリポジトリインターフェース以外は他レイヤーを直接参照しない

---

## 5. Anti-Corruption Layer (ACI 層／アンチコラプション層)

### 📝 責務
- **外部システムとのデータ変換・マッピング** を担当し、外部モデルとドメインモデルの衝突を防ぐ
- 大規模システムやマイクロサービス間で散在するアンチコラプション処理を **集約**
- 外部 API 仕様変更時にも、ドメインロジックへの影響を最小化

### 📦 主なコンポーネント
- **マッピング関数／ファクトリ**
    - 外部 API レスポンス → 内部ドメインオブジェクト
    - 例：`ExternalJobApiMapper`, `CompanySearchApiAdapter`
- **Facade（ファサード）**
    - 複数外部サービスを統合し、内部向けに単一インターフェースを提供
- **データ検証／正規化ロジック**
    - 外部から受け取る文字列や日付フォーマットを、ドメイン層の仕様に合わせて変換
- **ACL 自動抽出ツール**（将来的に）
    - 既存システムからアンチコラプションポイントを検出する仕組み（TypeScript Reachability 等）

### 🔍 依存関係
- **Infrastructure Layer（インフラ層）** から呼び出されつつ、ドメイン層やユースケース層へは**インターフェース経由**
- **ドメインモデルの直接参照は禁止**し、あくまでマッピングを介してデータを流す

---

## 6. Presentation Layer（プレゼンテーション層／フロントエンド）

> ※ React（Next.js）など、UI 層に相当。  
> 層構造としては厳密にバックエンドの「layers.md」には含まれないことが多いが、  
> クライアント側も DDD + レイヤードを意識する場合はこのように整理できる。

### 📝 責務
- ユーザーが目にする画面・コンポーネントを実装
- API から取得したデータをグラフや表として **可視化**
- コンポーネント単位でロジックと表示を分離し、**再利用性** を確保
- ダッシュボード（KPI／グラフ）やモーダル、フォームなど各種 UI を管理

### 📦 主なコンポーネント
- **ページコンポーネント** (`pages/` または `app/` 配下)
    - `InterviewSchedulePage`, `CompanyListPage`, `KpiDashboardPage` など
- **UI コンポーネント** (`components/` 配下)
    - `InterviewCard`, `CompanyTagFilter`, `RadarChart`, `LineGraph` など
- **Service Hook / API Client**
    - `useFetchInterviews`, `useFetchKpi`, `useGoogleOAuth` などのカスタムフック
- **状態管理**
    - Context API / Redux / Zustand などを用いてグローバルステートを管理
- **チャートライブラリ**
    - `recharts` / `chart.js` などでグラフ描画を実装

### 🔍 依存関係
- **バックエンド API** への HTTP リクエスト
- **ユースケース層で定義されたエンドポイント契約** に依存
- フロントエンド同士の依存は、できるだけコンポーネントの props 経由でデータを渡す

---

## 🚦 まとめと多分ベストプラクティス(?)

1. **依存関係を一方向に保つ**
    - 上流（Domain） → 下流（Infrastructure）
    - 必要なインターフェースは必ず上位層に定義し、下位層で実装する
2. **レイヤーごとの責務を明確にする**
    - ドメイン層：ビジネスロジック・ルール
    - ユースケース層：業務フローのオーケストレーション
    - アプリケーション層：外部インターフェース、Web API
    - インフラ層：DB・キャッシュ・外部サービス連携
    - ACI 層：外部システムとのマッピング・翻訳
3. **インターフェース／DTO を活用する**
    - 変更吸収層を設けることで、仕様変更に強いアーキテクチャを実現
4. **テストをレイヤーごとに分離する**
    - ドメインユニットテスト：ビジネスロジック検証
    - ユースケースユニットテスト：業務フロー検証（リポジトリはモック）
    - API レイヤーテスト：E2E／統合テスト（実際の DB／外部 API 呼び出し）
5. **継続的改善**
    - 実装を進めながら、ユースケースやドメインモデルの変更が出たら都度リファクタ
    - 新たな外部サービス連携が増えたら ACI 層に追加し、他層を汚染しない

---


