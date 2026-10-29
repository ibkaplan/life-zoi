import type { Metadata } from "next";
import { AssessmentView } from "@/components/assessment-view";

export const metadata: Metadata = { title: "Lifestyle Assessment" };

export default function AssessmentPage() {
  return <AssessmentView />;
}
