import type { Metadata } from "next";
import { EncyclopediaAdminView } from "@/components/encyclopedia/admin-view";

export const metadata: Metadata = {
  title: "Encyclopedia editor",
  description: "Administrator page for writing, reviewing, and publishing Health Encyclopedia articles.",
};

export default function EncyclopediaAdminPage() {
  return <EncyclopediaAdminView />;
}
