import type { Metadata } from "next";
import { SimplePlate } from "@/components/food-plan/simple-ui";

export const metadata: Metadata = {
  title: "Build my simple plate",
  description: "Pick a protein, vegetables, a fiber-rich carbohydrate, and a healthy fat.",
};

export default function PlatePage() {
  return <SimplePlate />;
}
