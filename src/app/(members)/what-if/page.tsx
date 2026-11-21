import type { Metadata } from "next";
import { WhatIfView } from "@/components/what-if-view";

export const metadata: Metadata = {
  title: "WHAT IF?",
  description: "Explore how a habit change might relate to everyday health. An illustration, not a prediction.",
};

export default function WhatIfPage() {
  return <WhatIfView />;
}
