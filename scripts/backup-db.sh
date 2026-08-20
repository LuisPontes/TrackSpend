#!/usr/bin/env bash
set -euo pipefail

# Backup do MongoDB Atlas (TrackSpend) via mongodump.
# Uso:
#   ./scripts/backup-db.sh              # backup normal (gzip, um ficheiro por coleção)
#   ./scripts/backup-db.sh --archive    # backup num único ficheiro .archive.gz
#
# Credenciais lidas de atlas-credentials.env (na raiz do projeto).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/atlas-credentials.env"
BACKUP_DIR="$ROOT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: não encontrei $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

if [ -z "${MONGODB_URI:-}" ]; then
  echo "Erro: MONGODB_URI não definido em $ENV_FILE" >&2
  exit 1
fi

DB_NAME="trackspend"
mkdir -p "$BACKUP_DIR"

if [ "${1:-}" = "--archive" ]; then
  OUT_FILE="$BACKUP_DIR/trackspend-$TIMESTAMP.archive.gz"
  echo "A criar backup em: $OUT_FILE"
  mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --gzip --archive="$OUT_FILE"
  echo "Backup concluído: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"
else
  OUT_DIR="$BACKUP_DIR/trackspend-$TIMESTAMP"
  echo "A criar backup em: $OUT_DIR"
  mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --gzip --out="$OUT_DIR"
  echo "Backup concluído: $OUT_DIR ($(du -sh "$OUT_DIR" | cut -f1))"
fi

# Mantém apenas os 14 backups mais recentes.
KEEP=14
ls -1dt "$BACKUP_DIR"/trackspend-* 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -rf
