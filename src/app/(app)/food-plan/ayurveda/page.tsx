import type { Metadata } from "next";
import { AyurvedaPage } from "@/components/food-plan/learn";

export const metadata: Metadata = {
  title: "Ayurvedic Inspiration",
  description: "Traditional dosha ideas as inspiration only. Not a diagnosis, and not medically validated biological classes.",
};

export default function AyurvedaRoute() {
  return <AyurvedaPage />;
}
