import type { Metadata } from "next";
import { RecommendationsView } from "@/components/recommendations-view";

export const metadata: Metadata = { title: "Guidance" };

export default function RecommendationsPage() {
  return <RecommendationsView />;
}
