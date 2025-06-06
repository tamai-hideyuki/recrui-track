#!/usr/bin/env bash
set -e

# カラーディレクティブ
RED="\033[31m"
BLUE="\033[34m"
RESET="\033[0m"

# apps/frontend の npm run dev を赤色で実行
(
  cd ../apps/frontend || exit 1
  echo -e "${RED}▶ Starting Frontend (npm run dev)${RESET}"
  npm run dev 2>&1 | sed -e "s/^/${RED}/" -e "s/\$/$(echo -e ${RESET})/"
) &

# apps/backend の npm run dev を青色で実行
(
  cd ../apps/backend || exit 1
  echo -e "${BLUE}▶ Starting Backend (npm run dev)${RESET}"
  npm run dev 2>&1 | sed -e "s/^/${BLUE}/" -e "s/\$/$(echo -e ${RESET})/"
) &

# 両方のプロセスが終わるまで待機
wait
