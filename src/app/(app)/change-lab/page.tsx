import type { Metadata } from "next";
import { ChangeLabView } from "@/components/change-lab-view";

export const metadata: Metadata = {
  title: "Change Lab",
  description: "A personal lifestyle experiment with a baseline, a short plan, and a before-and-after record.",
};

export default function ChangeLabPage() {
  return <ChangeLabView />;
}
