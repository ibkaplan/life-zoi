import type { Metadata } from "next";
import { SimpleKeep } from "@/components/food-plan/simple-ui";

export const metadata: Metadata = {
  title: "Lose fat. Support your muscles. Keep your meals simple.",
  description: "A moderate approach to fat loss that does not ignore muscle or promise results.",
};

export default function KeepPage() {
  return <SimpleKeep />;
}