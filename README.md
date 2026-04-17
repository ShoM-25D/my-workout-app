# my-workout-app

筋トレの記録を管理するためのフルスタックアプリケーションです。

## 開発環境の構築

### 1. 前提条件
以下のツールがインストールされていることを確認してください。
- **Docker / Docker Compose**
- **Git**

### 2. リポジトリの取得

**Gitを使用する場合：**
```bash
git clone [https://github.com/ShoM-25D/my-workout-app.git](https://github.com/ShoM-25D/my-workout-app.git)
cd my-workout-app
```

**ZIPファイルの場合：**
 1. ZIPファイルをダウンロードして解凍します。
 2. 解凍したフォルダへ移動します。

### 3. 環境変数の設定
`.env.example`をコピーして`.env`ファイルを作成し、環境に合わせて内容を編集します。
```bash
cp .env.example .env
```
**.envファイルの編集項目：**

| 変数名 | 設定内容・説明 |
| :--- | :--- |
| `POSTGRES_USER` | 任意のユーザー名 |
| `POSTGRES_PASSWORD` | 任意のパスワード |
| `POSTGRES_DB` | 任意のデータベース名 |
| `DATABASE_URL` | `postgresql://<ユーザー名>:<パスワード>@localhost:5432/<DB名>` |
| `DATABASE_URL_DOCKER` | `postgresql://<ユーザー名>:<パスワード>@db:5432/<DB名>` |
| `SECRET_KEY` | 任意のランダムな文字列 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |
