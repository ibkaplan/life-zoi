"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { HabitPicker, MissionCard, PracticeCalendar } from "@/components/library/session-tools";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";

export function PracticeView() {
  const t = useT();
  return (
    <div className="library stack-lg">
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t("Daily practice")}</h1>
      <p className="lede">
        {t("An optional mission, a habit you can pick, and a calendar that only marks days you recorded. Blank days stay blank.")}
      </p>
      <MissionCard />
      <PracticeCalendar />
      <HabitPicker />
      <p>
        <Link href="/habits">{t("Open shared challenges")}</Link>
        {" · "}
        <Link href="/library/move">{t("Movement checkoffs")}</Link>
      </p>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
    </div>
  );
}
