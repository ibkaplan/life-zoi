import type { Metadata } from "next";
import { BreatheHome } from "@/components/breathe/views";

export const metadata: Metadata = {
  title: "Breathe for Life – Nitric Oxide & Healthy Aging",
  description: "Gentle breathing, nitrate-rich foods, and walking to support your natural nitric oxide pathways. Educational only. Not a diagnosis or treatment.",
};

export default function Page() {
  return <BreatheHome />;
}
