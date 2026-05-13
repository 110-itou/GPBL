# GPBL / DockFlow

DockFlowは、造船部材の発注状況、納入予定、納入済み情報、保管場所、移動履歴、添付資料を管理するWebアプリケーションです。

このリポジトリでは、実装本体は `dockflow/` 配下にあります。ルートのREADMEは、人間の開発者と生成AIのどちらも迷わず作業できるように、構造・起動方法・主要な設計判断をまとめる入口です。

## アプリケーション概要

- 管理者と納入業者を、ログインではなくユーザー選択で切り替える簡易運用です。
- 管理者はダッシュボード、カレンダー、納入一覧、CSV出力、マスタ管理を使います。
- 納入業者は自分の納入状況確認と納入登録を行います。
- 納入物はA〜Kの保管場所、状態、数量、予定日、受取日、メモを持ちます。
- 保管場所が変わると `movement_logs` に移動履歴を残します。
- 写真・PDF添付用のテーブルとCloudinary連携ユーティリティがあります。

## 技術構成

| 領域 | 技術 |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, FullCalendar, Axios, lucide-react |
| Backend | Node.js, Express, pg |
| Database | PostgreSQL |
| File Upload | Cloudinary想定 |
| Deployment | Render |

## リポジトリ構成

```text
.
├── README.md
├── render.yaml
└── dockflow/
    ├── README.md
    ├── DEPLOYMENT.md
    ├── render.yaml
    ├── backend/
    │   ├── server.js
    │   ├── package.json
    │   ├── .env.example
    │   ├── middleware/
    │   │   └── upload.js
    │   └── scripts/
    │       ├── migrate.js
    │       └── seed.js
    └── frontend/
        ├── package.json
        ├── .env.example
        ├── vite.config.js
        ├── tailwind.config.js
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── index.css
            ├── assets/
            ├── components/
            ├── contexts/
            ├── data/
            ├── services/
            └── utils/
```

### 主要ファイル

| ファイル | 役割 |
| --- | --- |
| `dockflow/backend/server.js` | Express API本体。ルーティング、DB操作、CSV出力、添付情報管理をまとめている |
| `dockflow/backend/scripts/migrate.js` | PostgreSQLテーブルとインデックスを作成する |
| `dockflow/backend/scripts/seed.js` | 開発用サンプルデータを投入する。既存データを削除するので注意 |
| `dockflow/backend/middleware/upload.js` | Cloudinaryとmulterのアップロード設定 |
| `dockflow/frontend/src/App.jsx` | 画面ルーティング定義 |
| `dockflow/frontend/src/services/api.js` | Axios APIクライアントと各API関数 |
| `dockflow/frontend/src/contexts/UserContext.jsx` | 選択中ユーザーの保持。`localStorage` を使う |
| `dockflow/frontend/src/components/` | 各画面コンポーネント |
| `dockflow/frontend/src/assets/map.png` | A〜Kの場所選択で使うマップ画像 |
| `render.yaml` | Render Blueprint用設定。ルート版がリポジトリルートからのデプロイ向け |

## ローカル開発セットアップ

### 前提

- Node.jsとnpm
- PostgreSQL
- 必要ならCloudinaryアカウント

### 1. データベースを用意

PostgreSQLに `dockflow` など任意のDBを作成し、接続文字列を用意します。

例:

```bash
createdb dockflow
```

### 2. バックエンドを起動

```bash
cd dockflow/backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

`dockflow/backend/.env` の例:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dockflow
PORT=5001
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

補足:

- `server.js` の既定ポートは `5001` です。
- `.env` で `PORT` を変える場合は、`dockflow/frontend/vite.config.js` のプロキシ先、またはフロントエンドの `VITE_API_URL` も同じポートに合わせます。
- `npm run migrate` はテーブル作成のみです。
- `npm run seed` は既存データを削除してサンプルデータを投入します。

### 3. フロントエンドを起動

```bash
cd dockflow/frontend
npm install
cp .env.example .env
npm run dev
```

`dockflow/frontend/.env` の例:

```env
VITE_API_URL=/api
```

起動後は通常 `http://localhost:3000` を開きます。`VITE_API_URL=/api` の場合は、Viteの開発プロキシが `http://localhost:5001` に転送します。

## 開発時によく使うコマンド

| 場所 | コマンド | 内容 |
| --- | --- | --- |
| `dockflow/backend` | `npm run dev` | nodemonでAPIサーバーを起動 |
| `dockflow/backend` | `npm start` | Node.jsでAPIサーバーを起動 |
| `dockflow/backend` | `npm run migrate` | DBテーブルとインデックスを作成 |
| `dockflow/backend` | `npm run seed` | 開発用データを再投入。既存データは削除される |
| `dockflow/frontend` | `npm run dev` | Vite開発サーバーを起動 |
| `dockflow/frontend` | `npm run build` | 本番用ビルド |
| `dockflow/frontend` | `npm run preview` | ビルド結果のプレビュー |

現状、専用のテストコマンドは定義されていません。変更後の最低限の確認は、フロントエンドの `npm run build` と、APIの `/api/health` へのアクセスで行います。

## 画面とルーティング

| パス | コンポーネント | 内容 |
| --- | --- | --- |
| `/` | `UserSelection` | 管理者・納入業者のユーザー選択 |
| `/admin` | `AdminDashboard` | 管理者ダッシュボード、カレンダー、CSV出力 |
| `/vendor` | `VendorDashboard` | 納入業者向けダッシュボード |
| `/map-selector` | `MapSelector` | マップからA〜Kの保管場所を選択 |
| `/delivery-registration` | `DeliveryRegistration` | 納入登録 |
| `/delivery-list` | `DeliveryList` | 納入一覧と検索・フィルタ |
| `/delivery/:id` | `DeliveryDetail` | 納入詳細、移動履歴、添付一覧 |
| `/delivery/:id/edit` | `DeliveryEdit` | 納入情報編集 |
| `/delivery/:id/location-change` | `LocationChange` | 保管場所変更 |
| `/master-management` | `MasterManagement` | 業者・品名・ユーザー表示のマスタ管理 |

## API概要

APIのベースURLはフロントエンドからは通常 `/api` です。ローカル開発ではViteのプロキシが `http://localhost:5001/api` に転送します。

| メソッド | パス | 内容 |
| --- | --- | --- |
| `GET` | `/health` | ヘルスチェック |
| `GET` | `/users` | ユーザー一覧 |
| `GET` | `/deliveries` | 納入一覧。`item_id`, `vendor_id`, `current_location`, `status`, `date` で絞り込み可能 |
| `POST` | `/deliveries` | 納入登録。`system_id` は `DLV-0001` 形式で自動採番 |
| `PUT` | `/deliveries/:id` | 納入更新。場所が変わると移動履歴を作成 |
| `DELETE` | `/deliveries/:id` | 納入の論理削除 |
| `GET` | `/deliveries/export/csv` | 納入一覧CSVを出力 |
| `GET` | `/vendors` | 業者一覧 |
| `POST` | `/vendors` | 業者作成 |
| `PUT` | `/vendors/:id` | 業者更新 |
| `DELETE` | `/vendors/:id` | 業者の論理削除 |
| `GET` | `/items` | 品名マスタ一覧 |
| `POST` | `/items` | 品名作成 |
| `PUT` | `/items/:id` | 品名更新 |
| `DELETE` | `/items/:id` | 品名の論理削除 |
| `GET` | `/calendar` | カレンダー用データ |
| `GET` | `/dashboard/summary` | 管理者ダッシュボード集計 |
| `GET` | `/deliveries/:id/movements` | 移動履歴 |
| `GET` | `/deliveries/:id/attachments` | 添付一覧 |
| `POST` | `/deliveries/:id/attachments` | 添付メタデータ登録 |
| `DELETE` | `/attachments/:id` | 添付の論理削除 |

## データモデル

`migrate.js` が作成する主なテーブルは次の通りです。

| テーブル | 内容 |
| --- | --- |
| `users` | ユーザー。`role` は `admin` または `vendor` |
| `vendors` | 業者マスタ。カレンダー表示用の `color_code` を持つ |
| `item_master` | 品名マスタ |
| `deliveries` | 納入データ本体 |
| `movement_logs` | 保管場所の移動履歴 |
| `attachments` | 写真・PDF添付のメタデータ |

`deliveries.status` は次の4値です。

- `納入予定`
- `納入済`
- `移動済`
- `使用済`

`deliveries.current_location` は `A` 〜 `K` の1文字です。画面側のマップ座標は `MapSelector.jsx` と `LocationChange.jsx` にそれぞれ定義されています。

## 環境変数

### Backend

| 変数 | 必須 | 内容 |
| --- | --- | --- |
| `DATABASE_URL` | 必須 | PostgreSQL接続文字列 |
| `PORT` | 任意 | APIサーバーのポート。未指定時は `5001` |
| `CLOUDINARY_CLOUD_NAME` | 添付機能で必要 | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | 添付機能で必要 | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | 添付機能で必要 | Cloudinary API secret |

### Frontend

| 変数 | 必須 | 内容 |
| --- | --- | --- |
| `VITE_API_URL` | 任意 | APIベースURL。未指定時は `/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | 添付アップロードで必要 | Cloudinary cloud name |
| `VITE_CLOUDINARY_API_KEY` | 現状は設定判定に使用 | Cloudinary API key |
| `VITE_CLOUDINARY_API_SECRET` | 現状は設定判定に使用 | Cloudinary API secret |

注意: フロントエンドの `fileUpload.js` はCloudinaryへ直接アップロードするためのユーティリティを持ちますが、Cloudinary API secretをブラウザに渡す設計は本番では避けるべきです。本番化する場合は、署名付きアップロードをバックエンド経由にするか、unsigned upload presetの運用を明確にしてください。

## 生成AI・開発者向けメモ

- まず `dockflow/backend/server.js` と `dockflow/frontend/src/services/api.js` の対応関係を確認すると、API変更の影響範囲を追いやすいです。
- 画面追加やルート変更は `dockflow/frontend/src/App.jsx` に集約されています。
- 選択ユーザーは `UserContext.jsx` が `localStorage` に保存しています。認証・認可はまだサーバー側にありません。
- `UserContext.jsx` は `/api/users` を優先し、取得できない場合だけ固定のフォールバックユーザーを使います。
- `AdminDashboard.jsx` は `/api/calendar` をカレンダー表示に使い、API取得に失敗した場合はデモデータではなくエラー表示と空データにします。
- 添付ファイル登録は設計途中です。`DeliveryRegistration.jsx` にはアップロードUIがありますが、登録時の実アップロード処理はTODOのままです。
- 論理削除は `deleted_at` を使います。APIの一覧取得は基本的に `deleted_at IS NULL` を条件にしています。
- `seed.js` は `DELETE FROM` で関連テーブルの既存データを消します。本番DBや共有DBでは実行しないでください。
- ルートの `render.yaml` と `dockflow/render.yaml` はほぼ同じRender設定です。Render Blueprintで使う場合は、リポジトリルートの `render.yaml` を優先してください。

## デプロイ

Renderへのデプロイ手順は [dockflow/DEPLOYMENT.md](dockflow/DEPLOYMENT.md) にまとまっています。

概要:

- PostgreSQLサービス `dockflow-db` を作成します。
- バックエンドは `dockflow/backend` をRoot Directoryとして、`npm install` でビルドし、Pre-Deploy Commandの `npm run migrate` を実行してから `npm start` で起動します。
- フロントエンドは `dockflow/frontend` をRoot Directoryとして、`npm install && npm run build` でビルドし、`dist` を公開します。
- フロントエンドの `VITE_API_URL` は `/api` にして、Renderのrewriteでバックエンドへ転送します。

## 既知の注意点

- テストスクリプトは未整備です。
- DBマイグレーションは単一スクリプトで、差分マイグレーション管理ツールは未導入です。
- APIエラー時の画面表示はコンポーネントごとにばらつきがあります。
- 添付ファイル処理はUI、Cloudinaryユーティリティ、APIの責務がまだ整理途中です。
- CSV出力はサーバー作業ディレクトリに `deliveries.csv` を作ってからダウンロードします。並列アクセスやサーバーレス環境で改善余地があります。

## ライセンス

MIT License
