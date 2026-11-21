import type { Metadata } from "next";
import { LibraryManageView } from "@/components/companion/library-view";

export const metadata: Metadata = {
  title: "Library sources and approvals",
  description: "Which content sources are approved, and which videos still need an availability or free-status check.",
};

export default function LibraryManagePage() {
  return <LibraryManageView />;
}
