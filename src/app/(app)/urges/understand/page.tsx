import type { Metadata } from "next";
import { UnderstandView } from "@/components/wellness/urge-tools";

export const metadata: Metadata = {
  title: "Understand your urge",
  description: "Record a want, a feeling, and a choice without a diagnosis.",
};

export default function UnderstandPage() {
  return <UnderstandView />;
}
