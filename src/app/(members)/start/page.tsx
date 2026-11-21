import type { Metadata } from "next";
import { StartView } from "@/components/journey/start-view";

export const metadata: Metadata = {
  title: "Get started",
  description: "Welcome to LifeZoi: answer a short questionnaire, see your starting health profile, and get a personal plan.",
};

export default function StartPage() {
  return <StartView />;
}
