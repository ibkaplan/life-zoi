import type { Metadata } from "next";
import { LifeMattersView } from "@/components/life-matters-view";

export const metadata: Metadata = {
  title: "Your Life Matters",
  description:
    "A personal reflection on purpose, kindness, and the everyday health habits that can support the life you want.",
};

export default function LifeMattersPage() {
  return <LifeMattersView />;
}
