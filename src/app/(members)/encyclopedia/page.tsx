import type { Metadata } from "next";
import { EncyclopediaLanding } from "@/components/encyclopedia/landing-view";

export const metadata: Metadata = {
  title: "Health Encyclopedia",
  description: "LifeZoi Health Encyclopedia: 60 years of medical discoveries, explained with sources and evidence labels.",
};

export default function EncyclopediaPage() {
  return <EncyclopediaLanding />;
}
