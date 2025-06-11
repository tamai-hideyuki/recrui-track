# 1. ビルド用ステージ
FROM node:18-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# 2. 実行用ステージ
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production

ENV PORT=${FRONTEND_PORT}
EXPOSE ${FRONTEND_PORT}

CMD ["sh", "-c", "yarn start"]
