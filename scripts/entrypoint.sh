#!/bin/sh
set -eu

echo "[payme] running prisma generate"
npm run db:generate >/dev/null

echo "[payme] running prisma migrate deploy"
set +e
MIGRATE_OUT="$(npx prisma migrate deploy 2>&1)"
MIGRATE_CODE=$?
set -e

if [ "$MIGRATE_CODE" -ne 0 ]; then
  echo "$MIGRATE_OUT"
  if echo "$MIGRATE_OUT" | grep -q "Error: P3005"; then
    echo "[payme] baselining existing schema with initial migration"
    npx prisma migrate resolve --applied 20260327133000_init
    npx prisma migrate deploy
  else
    echo "[payme] migrate deploy failed"
    exit "$MIGRATE_CODE"
  fi
fi

echo "[payme] seeding themes (idempotent)"
set +e
DATABASE_URL="${DATABASE_URL:-}" npm run db:seed >/dev/null 2>&1
set -e

echo "[payme] starting next"
exec npm run start

