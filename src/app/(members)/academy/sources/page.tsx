import type { Metadata } from "next";
import { SourceRegistry } from "@/components/wellness/library-views";

export const metadata: Metadata = {
  title: "Source registry",
  description: "Sources opened for lifeZoi education, with license and access notes.",
};

export default function SourcesPage() {
  return <SourceRegistry />;
}
