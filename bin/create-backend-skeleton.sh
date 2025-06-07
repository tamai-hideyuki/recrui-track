#!/usr/bin/env bash
set -euo pipefail

#----------------------------------------
# 基本設定
#----------------------------------------
BASE_DIR="../apps/backend"

# 作成するディレクトリ一覧
DIRS=(
  "src/domain/entity"
  "src/domain/value-object"
  "src/domain/repository"
  "src/domain/service"
  "src/application/dto"
  "src/application/port"
  "src/application/usecase"
  "src/infrastructure/config"
  "src/infrastructure/db"
  "src/infrastructure/repository"
  "src/interface/controller"
  "src/interface/router"
  "src/shared"
)

# 作成する空ファイルの一覧（相対パスは BASE_DIR 以下）
FILES=(
  "drizzle.config.ts"
  "src/domain/entity/Todo.ts"
  "src/domain/value-object/Title.ts"
  "src/domain/repository/ITodoRepository.ts"
  "src/domain/service/TodoService.ts"
  "src/application/dto/CreateTodoInput.ts"
  "src/application/dto/UpdateTodoInput.ts"
  "src/application/dto/TodoOutput.ts"
  "src/application/port/TodoRepositoryPort.ts"
  "src/application/usecase/CreateTodoUseCase.ts"
  "src/application/usecase/DeleteTodoUseCase.ts"
  "src/application/usecase/GetAllTodosUseCase.ts"
  "src/application/usecase/GetTodoByIdUseCase.ts"
  "src/application/usecase/UpdateTodoUseCase.ts"
  "src/infrastructure/config/index.ts"
  "src/infrastructure/db/schema.ts"
  "src/infrastructure/db/db.ts"
  "src/infrastructure/repository/DrizzleTodoRepository.ts"
  "src/interface/controller/TodoController.ts"
  "src/interface/router/index.ts"
  "src/shared/errors.ts"
  "src/index.ts"
)

# .gitignore に追記する行
GITIGNORE_ENTRIES=(
  "local.db"
  "node_modules/"
  "dist/"
  "drizzle/"
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
update_gitignore

echo
echo "All files and directories have been created successfully in '${BASE_DIR}'."
