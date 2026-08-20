#!/usr/bin/env bash
set -euo pipefail

# Restaura um backup (criado por backup-db.sh) para a BD LOCAL (backend/.env DATABASE_URL).
# Apaga (--drop) as coleções locais antes de importar os dados do backup.
#
# Uso:
#   ./scripts/restore-db.sh                                  # restaura o backup mais recente em backups/
#   ./scripts/restore-db.sh backups/trackspend-20260820-085220        # pasta específica
#   ./scripts/restore-db.sh backups/trackspend-20260820-085220.archive.gz  # arquivo específico

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"
BACKUP_DIR="$ROOT_DIR/backups"
DB_NAME="trackspend"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: não encontrei $ENV_FILE" >&2
  exit 1
fi

LOCAL_URI="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n1 | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//')"
if [ -z "$LOCAL_URI" ]; then
  echo "Erro: DATABASE_URL não definido em $ENV_FILE" >&2
  exit 1
fi

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  TARGET="$(ls -1dt "$BACKUP_DIR"/trackspend-* 2>/dev/null | head -n1 || true)"
  if [ -z "$TARGET" ]; then
    echo "Erro: não encontrei nenhum backup em $BACKUP_DIR" >&2
    exit 1
  fi
fi

echo "BD local (destino): $(echo "$LOCAL_URI" | sed -E 's#//[^@]+@#//****@#')"
echo "Backup (origem):    $TARGET"
read -r -p "Isto vai APAGAR os dados locais atuais e substituí-los pelos do backup. Continuar? [y/N] " CONFIRMACAO
if [[ ! "$CONFIRMACAO" =~ ^[Yy]$ ]]; then
  echo "Cancelado."
  exit 1
fi

if [[ "$TARGET" == *.archive.gz ]]; then
  mongorestore --uri="$LOCAL_URI" --db="$DB_NAME" --gzip --drop --archive="$TARGET"
elif [ -d "$TARGET/$DB_NAME" ]; then
  mongorestore --uri="$LOCAL_URI" --db="$DB_NAME" --gzip --drop "$TARGET/$DB_NAME"
else
  echo "Erro: '$TARGET' não é um backup reconhecido (nem .archive.gz nem pasta com '$DB_NAME/')" >&2
  exit 1
fi

echo "Restauro concluído para a BD local ($DB_NAME)."
