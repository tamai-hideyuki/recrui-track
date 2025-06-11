#### ディレクトリ構成と役割

# プロジェクト構造 (`structure.md`)

このドキュメントでは、`recrui-track` プロジェクトのディレクトリ構成を示し、各フォルダ／ファイルの役割を説明します。  
DDD＋クリーンアーキテクチャを踏まえたレイヤーごとの分割と、ドキュメント配置も含めています。

---

## 1. 全体ツリーイメージ

```plaintext
recrui-track/
├── docs/
│
├── src/
│   ├── domain/           
│   │   ├── entities/    
│   │   │   ├── Interview.ts
│   │   │   ├── Company.ts
│   │   │   └── ...
│   │   ├── value-objects/
│   │   │   ├── ScheduleTime.ts
│   │   │   └── ...
│   │   ├── services/    
│   │   │   └── StatusTransitionService.ts
│   │   └── repositories/ 
│   │       ├── InterviewRepository.ts
│   │       └── ...
│   │
│   ├── usecases/        
│   │   ├── CreateInterviewUseCase.ts
│   │   ├── UpdateCompanyStatusUseCase.ts
│   │   └── ...
│   │
│   ├── application/      
│   │   ├── controllers/
│   │   │   ├── InterviewController.ts
│   │   │   ├── CompanyController.ts
│   │   │   └── AuthController.ts
│   │   ├── dto/          ← 入出力 DTO
│   │   │   ├── InterviewDTO.ts
│   │   │   ├── CompanyStatusDTO.ts
│   │   │   └── ...
│   │   ├── middleware/  
│   │   │   ├── AuthMiddleware.ts
│   │   │   └── ValidationMiddleware.ts
│   │   └── routes/      
│   │       └── todos.ts
│   │
│   ├── infrastructure/  
│   │   ├── repositories/
│   │   │   ├── DrizzleInterviewRepository.ts
│   │   │   └── ...
│   │   ├── db/          
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── external/    
│   │   │   ├── GoogleOAuthClient.ts
│   │   │   ├── SlackNotifier.ts
│   │   │   └── ...
│   │   ├── config/      
│   │   │   └── todos.ts
│   │   └── di/          
│   │       └── container.ts
│   │
│   ├── aci/             
│   │   ├── mappers/
│   │   │   ├── ExternalJobApiMapper.ts
│   │   │   └── ...
│   │   └── facades/
│   │       └── CompanySearchFacade.ts
│   │
│   └── presentation/    
│       ├── pages/       
│       │   ├── interviews/
│       │   ├── companies/
│       │   └── kpi.tsx
│       ├── components/  
│       │   ├── InterviewCard.tsx
│       │   ├── CompanyTagFilter.tsx
│       │   └── ...
│       ├── hooks/       
│       │   ├── useFetchInterviews.ts
│       │   └── ...
│       ├── store/       
│       └── public/      
│
├── tests/
│   ├── domain/          
│   │   └── Interview.test.ts
│   ├── usecases/        
│   │   └── CreateInterviewUseCase.test.ts
│   └── integration/     
│       └── InterviewApi.test.ts
│
├── docker/              
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env                 
├── .gitignore
└── package.json
```


---

## 2. 各ディレクトリの役割説明

### 2.1 `docs/`
- **目的**: プロジェクトの要件や設計をドキュメントとしてまとめる場所
- **主なファイル**:
    - `usecases.md` … ユースケース一覧／詳細
    - `layers.md` … レイヤー定義／依存ルール
    - `structure.md` … （本ファイル）ディレクトリ構成

---

### 2.2 `src/` （ソースコード本体）

#### 2.2.1 `src/domain/` （ドメイン層）
- **責務**: ビジネスルールを表現。エンティティ・値オブジェクトを保持し、ドメインサービスやリポジトリインターフェースを定義。
- **サブフォルダ**:
    - `entities/` … ドメインエンティティ定義（例：Interview, Company, User, Task）
    - `value-objects/` … 小粒度概念を表すオブジェクト（例：ScheduleTime, Status, Tag）
    - `services/` … ドメインサービス（複数エンティティを横断するビジネスロジック）
    - `repositories/` … リポジトリインターフェース（例：InterviewRepository, CompanyRepository）

#### 2.2.2 `src/usecases/` （ユースケース層）
- **責務**: ユースケースごとに「入力 → ドメイン操作 → 出力」を実装。
- **ファイル例**:
    - `CreateInterviewUseCase.ts` … 面談スケジュール作成の業務フロー
    - `UpdateCompanyStatusUseCase.ts` … 企業ステータス更新のフロー

#### 2.2.3 `src/application/` （アプリケーション層）
- **責務**: Web API エンドポイントやミドルウェアを通じてユースケースを呼び出す。
- **サブフォルダ**:
    - `controllers/` … コントローラー／ハンドラ（例：InterviewController, AuthController）
    - `dto/` … 入力／出力 DTO 定義（例：InterviewDTO, CompanyStatusDTO）
    - `middleware/` … 認証・バリデーション・ログなどの共通処理
    - `routes/` … ルーティング定義（Hono や Fastify など）

#### 2.2.4 `src/infrastructure/` （インフラ層）
- **責務**: 外部リソース（DB, キャッシュ, 外部 API）とのやり取りを具象化する実装を保持。
- **サブフォルダ**:
    - `repositories/` … ドメイン層のリポジトリインターフェースを具体実装（例：DrizzleInterviewRepository）
    - `db/` … データベース接続設定・スキーマ・マイグレーションファイル
    - `external/` … 外部サービスクライアント（例：GoogleOAuthClient, SlackNotifier）
    - `config/` … 環境変数や設定ファイルの読み込み（例：`dotenv` 設定）
    - `di/` … 依存注入コンテナの初期化（例：Tsyringe/Inversify のバインディング設定）

#### 2.2.5 `src/aci/` （アンチコラプション層）
- **責務**: 外部システムやマイクロサービスから取得したデータ形式をドメインモデルにマッピング／翻訳。
- **サブフォルダ**:
    - `mappers/` … JSON → ドメインオブジェクト変換処理
    - `facades/` … 複数外部 API をまとめたファサードインターフェース

#### 2.2.6 `src/presentation/` （プレゼンテーション層）
- **責務**: フロントエンド（Next.js など）で UI を実装。バックエンド API を呼び出し、データを可視化・操作する。
- **サブフォルダ**:
    - `pages/` … Next.js のページコンポーネント（例：`/interviews`, `/companies`, `/kpi`）
    - `components/` … 再利用可能な UI コンポーネント（例：`InterviewCard`, `RadarChart`）
    - `hooks/` … カスタムフック（例：`useFetchInterviews`, `useGoogleOAuth`）
    - `store/` … Zustand / Redux などの状態管理
    - `public/` … 静的ファイル（画像、favicon など）

---

### 2.3 `tests/` （テストコード一式）
- **目的**: 各レイヤーごとのテストを分離し、責務に応じた検証を行う。
- **構成**:
    - `domain/` … ドメインロジックのユニットテスト
    - `usecases/` … ユースケース（Interactor）単体テスト
    - `integration/` … API や DB 連携を含む統合テスト

---

### 2.4 `docker/`
- **目的**: 開発用・CI/CD 用の Docker 設定をまとめる。
- **内容**:
    - `Dockerfile` … アプリケーションコンテナイメージの定義
    - `docker-compose.yml` … 複数コンテナ（DB, Redis, API）を組み合わせる設定

---

### 2.5 ルート直下のファイル
- `.env` … 環境変数
- `.gitignore` … Git 管理対象外ファイル定義
- `package.json` … 依存パッケージとスクリプト定義

---

## 3. ポイントと注意点

1. **ディレクトリ名と責務を一貫させる**
    - フォルダ階層を見ただけで、どのレイヤー／モジュールが動いているか分かるように命名する。
2. **ドキュメントとコード配置を合わせる**
    - `docs/` に書いたユースケース (`usecases.md`)・レイヤー定義 (`layers.md`) と、実際の `src/` 側構造が一致するように心がける。
3. **依存注入を活用してレイヤー間の結合度を低く保つ**
    - `src/infrastructure/di/container.ts` で各インターフェースに実装をバインドし、コード中ではインターフェースを参照する。
4. **フロントエンドとバックエンドを明確に分離する**
    - `src/presentation/`（Next.js）と `src/`（バックエンド API）のルートを分け、リポジトリも別ディレクトリにする。
5. **テストファイルはレイヤーごとに配置する**
    - どのテストがどのレイヤーを検証しているか、一目で分かるようにフォルダを揃える。

