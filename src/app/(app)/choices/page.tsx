import type { Metadata } from "next";
import { ChoicesHome } from "@/components/wellness/choices-views";

export const metadata: Metadata = {
  title: "Why your daily choices matter",
  description: "Understand your body. Discover better habits. Make your life matter.",
};

export default function ChoicesPage() {
  return <ChoicesHome />;
}
