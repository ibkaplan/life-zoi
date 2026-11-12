import type { Metadata } from "next";
import { MyHealthView } from "@/components/my-health-view";

export const metadata: Metadata = {
  title: "My Health",
  description: "Your lifestyle assessment, life outlook, WHAT IF? comparisons, lab result explanations, and the Wellness Assistant in one place.",
};

export default function MyHealthPage() {
  return <MyHealthView />;
}
