import type { Metadata } from "next";
import { LibraryHome } from "@/components/library/home-view";

export const metadata: Metadata = {
  title: "Health Library",
  description:
    "Discover practical health guides, nutrition tips, exercise routines, recipes, and simple habits you can use every day.",
};

export default function LibraryPage() {
  return <LibraryHome />;
}
