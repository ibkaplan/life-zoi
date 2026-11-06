import type { Metadata } from "next";
import { ProteinWhy } from "@/components/food-plan/protein-ui";

export const metadata: Metadata = {
  title: "Why your body needs protein every day",
  description: "A short educational note on daily protein. Not a deficiency diagnosis.",
};

export default function ProteinWhyPage() {
  return <ProteinWhy />;
}
