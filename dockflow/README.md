# DockFlow

DockFlowは、造船部材の納入予定、納入状況、保管場所、移動履歴、添付資料を管理するWebアプリケーションです。

プロジェクト全体の構造、ローカル起動方法、API、DB、開発時の注意点は、リポジトリルートの [README.md](../README.md) を参照してください。

## このディレクトリの構成

```text
dockflow/
├── backend/        # Express APIサーバー
├── frontend/       # React + Vite フロントエンド
├── DEPLOYMENT.md   # Renderデプロイ手順
├── render.yaml     # Render Blueprint設定
└── README.md       # このファイル
```

## 最短起動手順

バックエンド:

```bash
cd dockflow/backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

フロントエンド:

```bash
cd dockflow/frontend
npm install
cp .env.example .env
npm run dev
```

ローカルでは、バックエンドの既定ポートは `5001`、フロントエンドは `3000` です。フロントエンドの `VITE_API_URL=/api` は、Viteの開発プロキシ経由でバックエンドに転送されます。
