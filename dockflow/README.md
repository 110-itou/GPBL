# DockFlow - 造船部材リアルタイム管理システム

造船業において、発注状況・納入予定・納入済み情報・保管場所・移動履歴・最新情報をリアルタイムに近い形で共有できるWebアプリケーション。

## 技術構成

- **Frontend**: React + Vite + Tailwind CSS + FullCalendar
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **File Upload**: Cloudinary
- **Deployment**: Render

## プロジェクト構成

```
dockflow/
├── frontend/          # Reactアプリケーション
├── backend/           # Express APIサーバー
├── render.yaml        # Renderデプロイ設定
└── README.md         # このファイル
```

## セットアップ

### バックエンド

```bash
cd backend
npm install
cp .env.example .env
# .envファイルに環境変数を設定
npm run dev
```

### フロントエンド

```bash
cd frontend
npm install
cp .env.example .env
# .envファイルにAPI URLを設定
npm run dev
```

### 環境変数設定

#### バックエンド (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/dockflow
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### フロントエンド (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 機能一覧

### ユーザー管理
- 管理者/納入業者の役割管理
- ログインなしのユーザー選択方式

### 納入管理
- 納入物登録（場所A〜Kのマップ選択）
- 状態管理（納入予定・納入済・移動済・使用済）
- 業者ごとの色分け表示
- 写真・PDF添付

### 場所管理
- A〜Kの固定保管場所
- 図面タップによる場所選択
- 移動履歴の自動記録

### カレンダー機能
- 業者ごとの色分けカレンダー
- 納入予定日の可視化

### マスタ管理（管理者専用）
- 業者管理
- 品名管理
- ユーザー管理

### その他機能
- CSV出力
- リアルタイム通知
- モバイル対応

## デプロイ

### Renderへのデプロイ

1. GitHubリポジトリにコードをプッシュ
2. RenderでPostgreSQLデータベースを作成
3. render.yamlを使用してフロントエンドとバックエンドをデプロイ

## ライセンス

MIT License
