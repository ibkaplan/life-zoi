import type { Metadata } from "next";
import { ProteinMuscle } from "@/components/food-plan/protein-ui";

export const metadata: Metadata = {
  title: "Weight loss without ignoring your muscles",
  description: "Moderate calorie estimates and muscle support, without guaranteed results or supplements.",
};

export default function ProteinMusclePage() {
  return <ProteinMuscle />;
}
