import type { Metadata } from "next";
import { StoriesView } from "@/components/encyclopedia/stories-view";

export const metadata: Metadata = { title: "Real People. Real Stories." };

export default function Page() {
  return <StoriesView />;
}
