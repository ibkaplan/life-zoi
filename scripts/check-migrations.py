#!/usr/bin/env python3
"""Refuses destructive SQL in supabase/migrations unless the owner approved it.

Destructive here means dropping a table, schema, or column, truncating, or
deleting or updating rows outside a function body. Function bodies (the text
between $$ ... $$) are skipped, so a function such as delete_own_account() that
deletes a person's own rows when they ask is allowed.

A file that really needs one of these must carry a line such as
    -- destructive-approved-by: Igor 2026-11-20
written after the owner approved it in writing.

Usage: scripts/check-migrations.py [files...]   (default: every migration)
"""
import pathlib
import re
import sys

APPROVAL = re.compile(r"^--\s*destructive-approved-by:\s*\S+.*\d{4}-\d{2}-\d{2}", re.I | re.M)
DOLLAR_BODY = re.compile(r"(\$[A-Za-z0-9_]*\$).*?\1", re.S)
LINE_COMMENT = re.compile(r"--[^\n]*")
BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.S)
SINGLE_QUOTED = re.compile(r"'(?:[^']|'')*'")
PATTERNS = [
    ("drop table", re.compile(r"\bdrop\s+table\b", re.I)),
    ("drop schema", re.compile(r"\bdrop\s+schema\b", re.I)),
    ("drop column", re.compile(r"\bdrop\s+(column\b|(?!constraint\b|default\b|not\b|identity\b|expression\b)[a-z_\"][\w\"]*\s*(,|cascade\b|restrict\b|$))", re.I)),
    ("truncate", re.compile(r"\btruncate\b", re.I)),
    ("delete rows", re.compile(r"\bdelete\s+from\b", re.I)),
    ("update rows", re.compile(r"\bupdate\s+[\w.\"]+\s+set\b", re.I)),
]


def strip(sql: str) -> str:
    sql = BLOCK_COMMENT.sub(" ", sql)
    sql = LINE_COMMENT.sub(" ", sql)
    sql = DOLLAR_BODY.sub(" ", sql)
    return SINGLE_QUOTED.sub("''", sql)


def main(argv: list[str]) -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    files = [pathlib.Path(a) for a in argv] or sorted((root / "supabase" / "migrations").glob("*.sql"))
    problems = 0
    for path in files:
        text = path.read_text(encoding="utf-8")
        if not re.fullmatch(r"\d{14}_[a-z0-9_]+\.sql", path.name):
            print(f"{path.name}: name must look like 20261120000000_short_name.sql")
            problems += 1
        if APPROVAL.search(text):
            continue
        body = strip(text)
        # A column drop is looked for only inside "alter table ..." statements.
        for label, pattern in PATTERNS:
            if label == "drop column":
                hits = [m for m in re.finditer(r"\balter\s+table\b[^;]*", body, re.I) if pattern.search(m.group(0))]
            else:
                hits = list(pattern.finditer(body))
            if hits:
                print(f"{path.name}: {label} needs the owner's approval line (-- destructive-approved-by: Name YYYY-MM-DD)")
                problems += 1
    if problems:
        return 1
    print(f"Checked {len(files)} migration file(s): nothing destructive.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
