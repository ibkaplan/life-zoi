import type { Metadata } from "next";
import { DailyTipView } from "@/components/daily-tip/daily-tip-view";

export const metadata: Metadata = {
  title: "Daily tip by email or Telegram",
  description: "Get one short, general wellness tip a day by email or Telegram, in your language, at the time you choose.",
};

export default function DailyTipPage() {
  return <DailyTipView />;
}
