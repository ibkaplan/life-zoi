import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment-wizard";

export const metadata: Metadata = {
  title: "Lifestyle Assessment",
  description: "A multi-step lifestyle questionnaire. Not a diagnosis.",
};

export default function AssessmentPage() {
  return <AssessmentWizard />;
}
