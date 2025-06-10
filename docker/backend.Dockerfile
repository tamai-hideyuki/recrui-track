# 1. ビルド用ステージ (TypeScript をトランスパイル)
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile

# drizzle.config.ts をここでコピー
COPY drizzle.config.ts ./

# その他のソースコードをコピー
COPY . .
# backend のビルドスクリプトで dist/ に出力される想定
RUN yarn build

# 2. 実行用ステージ
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=${BACKEND_PORT}
EXPOSE ${BACKEND_PORT}
CMD ["node", "dist/index.js", "--port", "${BACKEND_PORT}"]