# Renderデプロイ手順

## 🚀 デプロイ前の準備

### 1. GitHubリポジトリ作成
```bash
git init
git add .
git commit -m "Initial commit: DockFlow application"
git branch -M main
git remote add origin https://github.com/your-username/dockflow.git
git push -u origin main
```

### 2. Renderアカウント設定
1. Renderダッシュボードにログイン
2. GitHub連携を有効化
3. `dockflow` リポジトリにアクセス権を付与

## 🏗️ デプロイ手順

### ステップ1: データベース作成
1. Renderダッシュボードで「New +」→「PostgreSQL」を選択
2. 設定：
   - Name: `dockflow-db`
   - Database Name: `dockflow`
   - User: `dockflow_user`
   - Region: 最寄りの地域を選択
3. 「Create Database」をクリック

### ステップ2: バックエンドデプロイ
1. Renderダッシュボードで「New +」→「Web Service」を選択
2. GitHubリポジトリを接続
3. 設定：
   - Name: `dockflow-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run migrate`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

### ステップ3: 環境変数設定
バックエンドサービスの環境変数を設定：
```
DATABASE_URL=[PostgreSQL接続文字列]
NODE_ENV=production
PORT=5000
CLOUDINARY_CLOUD_NAME=[任意]
CLOUDINARY_API_KEY=[任意]
CLOUDINARY_API_SECRET=[任意]
```

### ステップ4: フロントエンドデプロイ
1. 別のWeb Serviceを作成
2. 設定：
   - Name: `dockflow-frontend`
   - Root Directory: `frontend`
   - Runtime: `Static`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### ステップ5: フロントエンド環境変数
```
VITE_API_URL=https://dockflow-backend.onrender.com/api
```

### ステップ6: ルーティング設定
フロントエンドサービスの「Rewrite Rules」で：
```
Source: /api/*
Destination: https://dockflow-backend.onrender.com/api/*
Type: Rewrite

Source: /*
Destination: /index.html
Type: Rewrite
```

## 🔧 トラブルシューティング

### 問題1: ビルドが失敗する
**原因**: 依存関係のインストールエラー
**解決策**:
- `package.json`の依存関係を確認
- Node.jsのバージョンを指定（`engines`フィールド追加）

### 問題2: データベース接続エラー
**原因**: 接続文字列の問題
**解決策**:
- RenderのPostgreSQLダッシュボードから接続文字列をコピー
- SSLモードを確認

### 問題3: APIリクエストが失敗
**原因**: CORSまたはルーティングの問題
**解決策**:
- フロントエンドの`VITE_API_URL`を確認
- バックエンドのCORS設定を確認

### 問題4: ホワイトスクリーン
**原因**: フロントエンドのビルドエラーまたはルーティング問題
**解決策**:
- RenderのBuild Logsを確認
- ビルドが成功しているか確認
- ブラウザのコンソールエラーを確認

## 📋 デプロイチェックリスト

- [ ] GitHubリポジトリが正しく設定されている
- [ ] RenderのPostgreSQLが作成されている
- [ ] バックエンドの環境変数が設定されている
- [ ] フロントエンドの環境変数が設定されている
- [ ] ヘルスチェックが通過している
- [ ] フロントエンドからバックエンドAPIにアクセスできる
- [ ] データベースマイグレーションが実行されている

## 🌐 アクス方法

デプロイ完了後：
- フロントエンド: `https://dockflow-frontend.onrender.com`
- バックエンドAPI: `https://dockflow-backend.onrender.com/api`
- APIヘルスチェック: `https://dockflow-backend.onrender.com/api/health`

## 🔄 自動デプロイ設定

GitHubリポジトリの`main`ブランチにプッシュすると自動でデプロイされるように設定：
1. 各サービスの「Settings」→「Auto-Deploy」を有効化
2. デプロイするブランチを`main`に設定

## 📞 サポート

デプロイ問題が発生した場合：
1. RenderのLogsを確認（Build Logs、Runtime Logs）
2. GitHub Actionsの実行結果を確認
3. ブラウザの開発者ツールでネットワークエラーを確認
