import type { Metadata } from "next";
import { BreatheFoods } from "@/components/breathe/views";

export const metadata: Metadata = {
  title: "Foods for the nitrate pathway · Breathe for Life",
  description: "Nitrate-rich vegetables, simple recipes, and the role of oral bacteria. No supplements are recommended.",
};

export default function Page() {
  return <BreatheFoods />;
}
