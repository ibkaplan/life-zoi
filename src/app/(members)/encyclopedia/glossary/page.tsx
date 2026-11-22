import type { Metadata } from "next";
import { GlossaryView } from "@/components/encyclopedia/pages-view";

export const metadata: Metadata = { title: "Medical words explained" };

export default function Page() {
  return <GlossaryView />;
}
