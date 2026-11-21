import type { Metadata } from "next";
import { CardsIndex } from "@/components/library/cards-view";

export const metadata: Metadata = {
  title: "Share a healthy idea",
  description: "Square health ideas you can download or share. No guaranteed results.",
};

export default function CardsPage() {
  return <CardsIndex />;
}
