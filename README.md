# タスクボード

Trello風のタスク管理Webアプリケーション

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS 4 + shadcn/ui
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **ドラッグ&ドロップ**: @dnd-kit
- **ホスティング**: Vercel (予定)
- **CI/CD**: GitHub Actions

## 機能

### MVP機能

- ✅ ボード表示
- ✅ リスト（カラム）の追加・削除
- ✅ タスクカードの追加・編集・アーカイブ
- ✅ ドラッグ&ドロップによるカードの移動

### 今後の拡張機能

- ユーザー認証
- ボードの共有・権限管理
- カードの期限設定
- ラベル・タグ機能
- コメント機能
- 添付ファイル
- リアルタイム同期

## セットアップ

### 必要なツール

- Node.js 20以上
- Docker Desktop
- Git

### 開発環境の構築

1. リポジトリのクローン

```bash
git clone <repository-url>
cd task-manage-app
```

2. 依存パッケージのインストール

```bash
npm install
```

3. Dockerでデータベースを起動

```bash
cd docker
docker-compose up -d
```

4. Prismaのセットアップ

```bash
npm run db:generate
npm run db:push
```

5. 開発サーバーの起動

```bash
npm run dev
```

6. ブラウザで http://localhost:3000 にアクセス

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint

# Prisma Client生成
npm run db:generate

# データベースにスキーマを反映
npm run db:push

# マイグレーション作成
npm run db:migrate

# Prisma Studio起動
npm run db:studio
```

## プロジェクト構造

```
task-manage-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── board/[id]/        # ボード詳細ページ
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   └── board/            # ボード関連コンポーネント
├── lib/                  # ユーティリティ
├── types/                # TypeScript型定義
├── prisma/               # Prismaスキーマとマイグレーション
├── docker/               # Docker設定
├── .github/workflows/    # GitHub Actions
└── z/                    # 開発ドキュメント
```

## データベース

### ローカル環境

Dockerで起動したPostgreSQLを使用

```bash
# データベース起動
cd docker
docker-compose up -d

# データベース停止
docker-compose down

# データベースリセット（データ削除）
docker-compose down -v
```

### スキーマ

- **Board**: ボード
- **List**: リスト（カラム）
- **Card**: タスクカード

詳細は `prisma/schema.prisma` を参照

## デプロイ

Vercelへのデプロイを予定

1. Vercelプロジェクト作成
2. GitHubリポジトリと連携
3. 環境変数の設定
   - `DATABASE_URL`: Supabase PostgreSQL接続文字列
4. 自動デプロイ

## ライセンス

MIT
