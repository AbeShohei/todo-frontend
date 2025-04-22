# todo-frontend/app/Dockerfile

# --- Build Stage ---
    FROM node:20-alpine AS build
    WORKDIR /app
    # package.json と lock ファイルを先にコピーして依存関係をインストール
    COPY package*.json ./
    RUN npm install
    # ソースコード全体をコピー
    COPY . .
    # 環境変数をビルド時に設定できるように ARG を使う (docker-compose.yml から渡す)
    ARG VITE_API_BASE_URL
    ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
    # ビルド実行
    RUN npm run build
    
    # --- Run Stage ---
    FROM nginx:1.25-alpine
    # ビルドステージから生成された静的ファイル(distフォルダの中身)をNginxの公開ディレクトリにコピー
    COPY --from=build /app/dist /usr/share/nginx/html
    # (オプション) Nginxの設定ファイルをコピー (SPA用に調整する場合)
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    # Nginxがリッスンするポート
    EXPOSE 80
    # Nginxをフォアグラウンドで起動
    CMD ["nginx", "-g", "daemon off;"]