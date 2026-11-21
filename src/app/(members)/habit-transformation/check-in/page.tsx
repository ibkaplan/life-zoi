import type { Metadata } from "next";
import { CheckInView } from "@/components/habit-transformation/practice-views";

export const metadata: Metadata = {
  title: "Daily Check-In",
  description: "A short check-in that can offer a smaller next step.",
};

export default function CheckInPage() {
  return <CheckInView />;
}
