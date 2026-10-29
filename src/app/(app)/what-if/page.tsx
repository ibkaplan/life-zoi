import type { Metadata } from "next";
import { WhatIfList } from "@/components/what-if-view";

export const metadata: Metadata = { title: "WHAT IF?" };

export default function WhatIfPage() {
  return <WhatIfList />;
}
