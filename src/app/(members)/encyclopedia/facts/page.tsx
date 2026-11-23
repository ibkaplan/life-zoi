import type { Metadata } from "next";
import { FactsView } from "@/components/encyclopedia/facts-view";

export const metadata: Metadata = { title: "Did You Know? — Amazing Health Facts" };

export default function Page() {
  return <FactsView />;
}
