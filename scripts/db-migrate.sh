#!/usr/bin/env bash
# Applies new files in supabase/migrations to the database in SUPABASE_DB_URL.
# Used by .github/workflows/db-migrate.yml after a merge to main.
#
#   1. Refuses destructive SQL without the owner's approval line (scripts/check-migrations.py).
#   2. Runs supabase/verify.sql and prints the result (failures here are expected
#      when a migration adds something new).
#   3. Applies migrations not yet recorded in supabase_migrations.schema_migrations
#      with the Supabase CLI (`supabase db push`).
#   4. Runs supabase/verify.sql again and fails if any line is not ok.
#
# verify.sql only reads catalog information. It never reads anyone's rows.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is not set. Add it as a GitHub Actions secret (see docs/SUPABASE_SETUP.md)." >&2
  exit 1
fi
SUPABASE_BIN="${SUPABASE_BIN:-supabase}"

verify() {
  psql "$SUPABASE_DB_URL" -X -q -At -v ON_ERROR_STOP=1 -F ' | ' -f supabase/verify.sql
}

python3 scripts/check-migrations.py

echo "== verify.sql before =="
before=$(verify)
echo "$before"
echo "Not ok before: $(echo "$before" | awk -F' [|] ' '$3 != "t"' | wc -l)"

echo "== Migrations not yet applied =="
"$SUPABASE_BIN" migration list --db-url "$SUPABASE_DB_URL" || true

echo "== Applying =="
"$SUPABASE_BIN" db push --db-url "$SUPABASE_DB_URL" --yes

echo "== verify.sql after =="
after=$(verify)
echo "$after"
failed=$(echo "$after" | awk -F' [|] ' '$3 != "t"' | wc -l)
if [ "$failed" -ne 0 ]; then
  echo "verify.sql reported $failed failing checks after the migration." >&2
  exit 1
fi
echo "verify.sql: every check is ok."
