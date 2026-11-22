import type { Metadata } from "next";
import { EasternWesternView } from "@/components/encyclopedia/pages-view";

export const metadata: Metadata = { title: "Eastern & Western Medicine" };

export default function Page() {
  return <EasternWesternView />;
}
