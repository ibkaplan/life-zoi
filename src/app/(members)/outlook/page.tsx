import type { Metadata } from "next";
import { OutlookView } from "@/components/outlook-view";

export const metadata: Metadata = {
  title: "Life outlook",
  description: "A population table and a separate personal profile. Not an individual lifespan prediction.",
};

export default function OutlookPage() {
  return <OutlookView />;
}
