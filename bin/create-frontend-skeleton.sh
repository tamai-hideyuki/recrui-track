#!/usr/bin/env bash
set -e

BASE_DIR=../apps/frontend

#----------------------------------------
# 作成するディレクトリ一覧
#----------------------------------------
DIRS=(
  "types/"
)

#----------------------------------------
# 作成するファイル一覧
#----------------------------------------
FILES=(
  "package.json"
  "tsconfig.json"
  "types/todo.ts"
)

#----------------------------------------
# ヘルパー関数
#----------------------------------------
create_directories() {
  echo "=== Creating directories under ${BASE_DIR} ==="
  for dir in "${DIRS[@]}"; do
    mkdir -p "${BASE_DIR}/${dir}"
  done
}

init_package_json() {
  echo "=== Initializing package.json ==="
  if [[ -f "${BASE_DIR}/package.json" ]]; then
    echo "  → package.json already exists, skipping npm init."
  else
    (cd "${BASE_DIR}" && npm init -y)
  fi
}

init_tsconfig() {
  echo "=== Initializing tsconfig.json ==="
  local tsconfig_path="${BASE_DIR}/tsconfig.json"

  if [[ -f "${tsconfig_path}" ]]; then
    echo "  → tsconfig.json already exists, skipping."
    return
  fi

  (
    cd "${BASE_DIR}"
    if command -v tsc >/dev/null 2>&1; then
      echo "  → Found global tsc, running tsc --init..."
      tsc --init
    else
      echo "  → tsc command not found. Installing TypeScript locally..."
      npm install --save-dev typescript
      echo "  → Running npx tsc --init..."
      npx tsc --init
    fi
  )
}

create_empty_files() {
  echo "=== Creating empty files under ${BASE_DIR} ==="
  for file in "${FILES[@]}"; do
    fullpath="${BASE_DIR}/${file}"
    mkdir -p "$(dirname "${fullpath}")"
    if [[ ! -e "${fullpath}" ]]; then
      touch "${fullpath}"
    else
      echo "  → ${file} already exists, skipping."
    fi
  done
}

update_gitignore() {
  echo "=== Updating .gitignore ==="
  local gitignore_path="${BASE_DIR}/.gitignore"
  touch "${gitignore_path}"
  for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if ! grep -Fxq "${entry}" "${gitignore_path}"; then
      echo "${entry}" >> "${gitignore_path}"
    else
      echo "  → ${entry} is already in .gitignore, skipping."
    fi
  done
}

#----------------------------------------
# 実行フロー
#----------------------------------------
echo "Start scaffolding for '${BASE_DIR}'..."

create_directories
init_package_json
init_tsconfig
create_empty_files

echo
echo "All files and directories have been created successfully in '${BASE_DIR}'."
