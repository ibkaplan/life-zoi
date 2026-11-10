"use client";

import { useT } from "@/components/locale-provider";
import { ReadAloud } from "@/components/voice/read-aloud";

/**
 * Pages that can show the person's own answers, plans, or results. Their text is
 * read only with voices that run on the device, never an online voice.
 */
const PERSONAL_PREFIXES = [
  "/dashboard",
  "/profile",
  "/assessment",
  "/what-if",
  "/progress",
  "/settings",
  "/sign-in",
  "/reset-password",
  "/lab-results",
  "/outlook",
  "/change-lab",
  "/life-matters",
  "/my-day",
  "/plan",
  "/share-the-care",
  "/community",
  "/welcome",
  "/ai-assistant",
];

export function isPersonalPage(pathname: string): boolean {
  return PERSONAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** "Listen to this page" at the top of every page: reads what is on screen, in the language shown. */
export function PageListen({ pathname, target = "main" }: { pathname: string; target?: string }) {
  const t = useT();
  return <ReadAloud key={pathname} target={target} label={t("Listen to this page")} compact privateText={isPersonalPage(pathname)} className="voice-page" />;
}
