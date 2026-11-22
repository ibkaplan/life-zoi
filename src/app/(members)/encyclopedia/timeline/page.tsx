import type { Metadata } from "next";
import { TimelineView } from "@/components/encyclopedia/pages-view";

export const metadata: Metadata = { title: "Medical discoveries timeline" };

export default function Page() {
  return <TimelineView />;
}
