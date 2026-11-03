import type { Metadata } from "next";
import { SugarDetectiveView } from "@/components/practice-views";

export const metadata: Metadata = {
  title: "Sugar Detective",
  description: "A private reflection on sweet cravings. Not a diagnosis.",
};

export default function SugarDetectivePage() {
  return <SugarDetectiveView />;
}
