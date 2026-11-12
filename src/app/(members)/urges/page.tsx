import type { Metadata } from "next";
import { UrgesHome } from "@/components/wellness/urge-views";

export const metadata: Metadata = {
  title: "Master Your Urges",
  description: "Understand cravings, calm attention, and choose a next step.",
};

export default function UrgesPage() {
  return <UrgesHome />;
}
