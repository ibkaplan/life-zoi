import type { Metadata } from "next";
import { LibraryView } from "@/components/encyclopedia/pages-view";

export const metadata: Metadata = { title: "My Library" };

export default function Page() {
  return <LibraryView />;
}
