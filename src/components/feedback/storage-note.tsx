"use client";

import { useT } from "@/components/locale-provider";

/** Said plainly when this server has no shared database and keeps feedback in memory. */
export function StorageNote({ storage }: { storage: "memory" | "account" }) {
  const t = useT();
  if (storage !== "memory") return null;
  return (
    <p className="fb-note" role="note">
      {t("This test server has no shared database, so feedback is kept in memory and disappears when the server restarts. On the live site it is saved in LifeZoi's database.")}
    </p>
  );
}
