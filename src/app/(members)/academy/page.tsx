import type { Metadata } from "next";
import { AcademyHome } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Nutrition and Fitness Academy",
  description: "Food education and an original exercise library. Not a diet plan.",
};

export default function AcademyPage() {
  return <AcademyHome />;
}
