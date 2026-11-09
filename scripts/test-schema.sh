#!/usr/bin/env bash
# Applies supabase/schema.sql twice to a throwaway local Postgres database,
# runs the policy checks, then runs the read-only setup check.
# Needs psql and a local Postgres you can create databases on. It never contacts Supabase.
#
#   PGHOST=/var/run/postgresql PGUSER=postgres scripts/test-schema.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="lifezoi_schema_test_$$"
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT
run() { psql -X -q -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
run -f supabase/test/stub-auth.sql
run -c "set client_min_messages = warning" -f supabase/schema.sql
run -c "set client_min_messages = warning" -f supabase/schema.sql
echo "schema.sql applied twice without errors."
run -f supabase/test/policies.sql
failed=$(run -At -f supabase/verify.sql | awk -F'|' '$3 != "t"' | wc -l)
if [ "$failed" -ne 0 ]; then
  echo "verify.sql reported $failed failing checks." >&2
  exit 1
fi
echo "verify.sql: every check is ok."
