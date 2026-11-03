import type { Metadata } from "next";
import { MomentView } from "@/components/wellness/urge-tools";

export const metadata: Metadata = {
  title: "Choose Your Moment",
  description: "Spend a few minutes on something that makes the day better. Rest counts.",
};

export default function MomentPage() {
  return <MomentView />;
}
