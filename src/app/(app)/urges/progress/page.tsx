import type { Metadata } from "next";
import { UrgeProgress } from "@/components/wellness/urge-plans";

export const metadata: Metadata = {
  title: "Urge progress",
  description: "Charts of your own urge notes. Examples stay separate.",
};

export default function UrgeProgressPage() {
  return <UrgeProgress />;
}
