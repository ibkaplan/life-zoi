import type { Metadata } from "next";
import { LabResultsView } from "@/components/lab-results-view";

export const metadata: Metadata = {
  title: "Understand My Lab Results",
  description: "An example laboratory report with MedlinePlus references. Real documents are not uploaded.",
};

export default function LabResultsPage() {
  return <LabResultsView />;
}
