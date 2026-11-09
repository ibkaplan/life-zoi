import type { Metadata } from "next";
import { SpiceIndex } from "@/components/food-plan/learn";

export const metadata: Metadata = { title: "Spice guide", description: "Culinary spice notes without disease claims or supplement advice." };

export default function SpicesPage() {
  return <SpiceIndex />;
}
