import type { Metadata } from "next";
import { SciencePage } from "@/components/food-plan/learn";

export const metadata: Metadata = { title: "Food science", description: "Sources for the plate, protein estimates, and Ayurveda limits." };

export default function FoodSciencePage() {
  return <SciencePage />;
}
