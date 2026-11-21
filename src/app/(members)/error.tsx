"use client";

import { useT } from "@/components/locale-provider";

export default function AppError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useT();
  return (
    <div className="card stack" role="alert">
      <h1>{t("Something went wrong")}</h1>
      <p>{t("This page could not be shown. If you had typed answers, they may still be in this browser tab.")}</p>
      <button className="btn btn-primary" type="button" onClick={() => retry()}>
        {t("Try again")}
      </button>
    </div>
  );
}
