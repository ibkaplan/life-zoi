import type { Metadata } from "next";
import { ListenedView } from "@/components/feedback/listened-view";

export const metadata: Metadata = {
  title: "You asked, we listened!",
  description: "Changes LifeZoi made because members asked for them.",
};

export default function ListenedPage() {
  return <ListenedView />;
}
