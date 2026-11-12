import type { Metadata } from "next";
import { MotivationView } from "@/components/wellness/choices-views";

export const metadata: Metadata = {
  title: "Personal motivation",
  description: "Reasons that matter to you. Worth does not depend on ability.",
};

export default function MotivationPage() {
  return <MotivationView />;
}
