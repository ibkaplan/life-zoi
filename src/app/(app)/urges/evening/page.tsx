import type { Metadata } from "next";
import { EveningView } from "@/components/wellness/urge-views";

export const metadata: Metadata = {
  title: "Late-night eating",
  description: "An example evening plan. No required clock time.",
};

export default function EveningPage() {
  return <EveningView />;
}
