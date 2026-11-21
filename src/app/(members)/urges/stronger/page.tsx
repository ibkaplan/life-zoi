import type { Metadata } from "next";
import { StrongerView } from "@/components/wellness/urge-views";

export const metadata: Metadata = {
  title: "Be stronger than your urges",
  description: "A choice you can delay. Hunger still gets food.",
};

export default function StrongerPage() {
  return <StrongerView />;
}
